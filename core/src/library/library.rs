use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use crate::{
    fs_utils::extract_location_path, library::notification::NotificationType, parsing, thumbnail,
};

use anyhow::anyhow;
use chrono::{TimeZone, Utc};
use codex_prisma::prisma::{self, collection, library, location, object::extension, PrismaClient};
use futures::future::try_join_all;
use log::{error, info};
use std::collections::HashSet;
use tokio::task;
use uuid::Uuid;

use codex_prisma::prisma::object;

use super::notification::{CodexNotification, NotificationManager};

//A decentralized library is a library that doesn't depend on a specific path and can have files from multiple paths.
//this is useful for libraries that are stored in the cloud, like Google Drive, Dropbox, etc.
// For now we'll only support local libraries, but in the future we'll support cloud libraries as well.
//The library will index the files and store the index in a database file.

// Our prisma schema looks like this:

// model FilePath {
//     id     Int   @id @default(autoincrement())
//     uuid           String    @unique

//     is_dir Boolean?

//     // the name and extension, MUST have 'COLLATE NOCASE' in migration
//     name      String?
//     extension String?

//     size_in_bytes_bytes Bytes?

//     // the unique LibraryObject for this file path
//     LibraryObject_id Int? @unique
//     LibraryObject    LibraryObject? @relation(fields: [LibraryObject_id], references: [id])

//     date_created  DateTime?
//     date_modified DateTime?
//     date_indexed  DateTime?
//   }

//   /// @shared(id: pub_id)
//   model LibraryObject {
//     id     Int   @id @default(autoincrement())
//     uuid           String    @unique

//     obj_name  String?
//     // Enum: sd_file_ext::kind::LibraryObjectKind
//     kind   Int?

//     // handy ways to mark an LibraryObject
//     hidden        Boolean?
//     favorite      Boolean?
//     important     Boolean?
//     note          String?
//     date_created  DateTime? @default(now())
//     date_accessed DateTime?

//     tags       TagOnLibraryObject[]
//     labels     LabelOnLibraryObject[]
//     file_path FilePath?
//     Library    Library?        @relation(fields: [libraryId], references: [id])
//     libraryId  Int?

//     @@map("LibraryObject")
//   }

//   model Library {
//     id              Int       @id @default(autoincrement())
//     uuid           String    @unique
//     name            String?
//     // Enum: ???
//     redundancy_goal Int?
//     date_created    DateTime?
//     date_modified   DateTime?
//     LibraryObjects         LibraryObject[]

//     @@map("library")
//   }

#[derive(Debug, Clone)]
pub struct LocalLibrary {
    pub uuid: Uuid,
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub db: Arc<PrismaClient>,
    pub notification_manager: Arc<NotificationManager>,
}

impl LocalLibrary {
    pub async fn new(
        uuid: Uuid,
        id: i32,
        name: String,
        description: Option<String>,
        db: Arc<PrismaClient>,
        notification_manager: Arc<NotificationManager>,
    ) -> Result<Arc<Self>, anyhow::Error> {
        //This library is not meant to be used to create new library objects.
        //It's meant to be used to load existing library objects from the database.
        //If the library doesn't exist in the database, we'll return an error.

        //To create new library objects, refer to the libraryManager.

        // Double check that the library exists in the database.

        info!("creating new library: {} with id: {}", name, id);

        let library = db
            .library()
            .find_unique(prisma::library::id::equals(id.clone()))
            .exec()
            .await?;

        info!("Loaded library: {:?}", library);

        if library.is_none() {
            info!("Library not found: {}", id);
            error!("Library not found");
        }

        let library = LocalLibrary {
            uuid,
            id,
            name,
            description,
            db,
            notification_manager: Arc::clone(&notification_manager),
        };

        library.index_objects().await?;

        Ok(Arc::new(library))
    }

    pub async fn add_collection(&self, name: String) -> Result<(), anyhow::Error> {
        let this_library_id = self.id.to_string();

        let _collection = self
            .db
            .collection()
            .create(
                library::uuid::equals(this_library_id.to_string()),
                vec![collection::name::set(Some(name.to_string()))],
            )
            .exec()
            .await?;

        Ok(())
    }

    pub async fn add_location(
        &self,
        path: PathBuf,
        collection_id: i32,
    ) -> Result<(), anyhow::Error> {
        //TODO: Should check if the location already exists in the database.
        //TODO: Should check if the location is a file or a directory.
        //TODO: Add a flag for recursive adding of files in the directory (if it is indeed a directory).
        let is_dir = path.is_dir();
        let path = path.to_str().ok_or_else(|| anyhow!("Invalid path"))?;

        let this_library_id = self.id.to_string();

        let location_db = self
            .db
            .location()
            .create(
                path.to_string(),
                vec![
                    location::collection::connect(collection::id::equals(collection_id.clone())),
                    location::is_dir::set(Some(is_dir)),
                ],
            )
            .exec()
            .await?;

        //Add all the files in the location to the collection.
        let mut files = Vec::new();
        if (is_dir) {
            for entry in fs::read_dir(path)? {
                let entry = entry?;
                let path = entry.path();
                if path.is_file() {
                    files.push(path);
                }
            }
        } else {
            files.push(PathBuf::from(path));
        }

        for file in files {
            let file_name = file.file_name().unwrap().to_str().unwrap();
            let file_path = file.to_str().unwrap();
            let metadata = fs::metadata(file_path)?;
            let date_modified = metadata
                .modified()?
                .duration_since(SystemTime::UNIX_EPOCH)?
                .as_secs();
            let extension = file.extension().unwrap().to_str().unwrap();
            let _object = self
                .db
                .object()
                .create(
                    library::uuid::equals(this_library_id.to_string()),
                    location::uuid::equals(location_db.uuid.clone()),
                    collection::id::equals(collection_id.clone()),
                    vec![
                        object::uuid::set(Uuid::new_v4().to_string()),
                        object::obj_name::set(Some(file_name.to_string())),
                        object::path::set(Some(file_path.to_string())),
                        object::extension::set(Some(extension.to_string())),
                        object::indexed::set(Some(false)),
                        object::date_modified::set(Some(
                            Utc.timestamp_millis_opt(date_modified.try_into().unwrap())
                                .unwrap()
                                .into(),
                        )),
                    ],
                )
                .exec()
                .await?;
        }

        //When a new location is added, we need to index the library.
        self.index_objects().await?;

        Ok(())
    }

    pub async fn get_library(&self) -> Result<prisma::library::Data, anyhow::Error> {
        let library = self
            .db
            .library()
            .find_unique(prisma::library::id::equals(self.id))
            .exec()
            .await?;

        if let Some(library) = library {
            Ok(library)
        } else {
            Err(anyhow!("Library not found".to_string()))
        }
    }

    pub async fn index_objects(&self) -> Result<(), anyhow::Error> {
        info!("Indexing objects for library: {}", self.name);
        let (changed_files, _, deleted_files) = self.check_for_changes().await?;

        let library = self.get_library().await?;
        let _library_uuid = &library.uuid;

        for file in deleted_files {
            if let Ok(deleted) = self
                .db
                .object()
                .delete_many(vec![object::path::equals(Some(
                    file.to_str().unwrap().to_string(),
                ))])
                .exec()
                .await
            {
                info!("Deleted file: {:?}", deleted);
                self.emit_notification(CodexNotification::new(
                    format!("{}{}", "deleted file: ".to_string(), file.to_str().unwrap()),
                    NotificationType::FileRemoved,
                ))
                .await?
            } else {
                error!("Failed to delete file: {:?}", file);
            }
        }

        // We'll then update the changed files.
        for file in changed_files {
            self.db
                .object()
                .update(
                    object::uuid::equals(file.uuid),
                    vec![object::date_modified::set(Some(Utc::now().into()))],
                )
                .exec()
                .await?;
        }

        //Get all collections belonging to this library:
        let collections = self
            .db
            .collection()
            .find_many(vec![collection::library::is(vec![library::id::equals(
                self.id,
            )])])
            .exec()
            .await?;

        info!(
            "Found collections: {:?} belonging to this library",
            collections
        );

        for collection in collections {
            let locations = self
                .db
                .location()
                .find_many(vec![location::collection::is(vec![
                    collection::id::equals(collection.id),
                ])])
                .exec()
                .await?;
            info!(
                "Found locations: {:?} belonging to this collection",
                locations
            );

            // If there are changes, we'll update the library.
            // We'll start by deleting the deleted files.

            //TODO: Clean this up later:

            // Step 3: Insert new files
            for location in locations {
                let (new_files) = self.check_location_for_new_files(&location).await?;
                info!("New files: {:?}", new_files);

                // If there are no new files, we don't need to do anything.
                if new_files.is_empty() {
                    continue;
                }

                for file in new_files {
                    let file_name = file.file_name().unwrap().to_str().unwrap();
                    let file_path = file.to_str().unwrap();
                    let metadata = fs::metadata(file_path)?;
                    let date_modified = metadata
                        .modified()?
                        .duration_since(SystemTime::UNIX_EPOCH)?
                        .as_secs();

                    //Handle extension errors:

                    let extension = file.extension();
                    if let Some(extension) = extension {
                        let extension = extension.to_str().unwrap();
                        if let Ok(_object) = self
                            .db
                            .object()
                            .create(
                                library::id::equals(self.id),
                                location::uuid::equals(location.uuid.clone()),
                                collection::id::equals(collection.id.clone()),
                                vec![
                                    object::uuid::set(Uuid::new_v4().to_string()),
                                    object::obj_name::set(Some(file_name.to_string())),
                                    object::path::set(Some(file_path.to_string())),
                                    object::extension::set(Some(extension.to_string())),
                                    object::indexed::set(Some(false)),
                                    object::date_modified::set(Some(
                                        Utc.timestamp_millis_opt(date_modified.try_into().unwrap())
                                            .unwrap()
                                            .into(),
                                    )),
                                ],
                            )
                            .exec()
                            .await
                        {
                            info!("Added file: {:?}", file);
                        } else {
                            error!("Failed to add file: {:?} to library id: {}, to location uuid: {} and collection id: {}", file, self.id, location.uuid, collection.id);
                        };

                        self.emit_notification(CodexNotification::new(
                            format!("{}{}", "added file:".to_string(), file.to_str().unwrap()),
                            NotificationType::FileAdded,
                        ))
                        .await?;
                    } else {
                        self.emit_notification(CodexNotification::new(
                            format!(
                                "{}{}",
                                "Could not add file:".to_string(),
                                file.to_str().unwrap()
                            ),
                            NotificationType::IndexingFailed,
                        ))
                        .await?;

                        error!("Failed to get extension for file: {:?}", file);
                    }
                }
            }
        }

        Ok(())
    }

    pub async fn generate_thumbnails(&self) -> Result<(), anyhow::Error> {
        let collections = self
            .db
            .collection()
            .find_many(vec![collection::library::is(vec![library::id::equals(
                self.id,
            )])])
            .exec()
            .await?;

        let locations = self
            .db
            .location()
            .find_many(vec![location::collection::is(vec![
                collection::id::in_vec(
                    collections
                        .iter()
                        .map(|collection| collection.id.clone())
                        .collect(),
                ),
            ])])
            .exec()
            .await?;

        // Use a stream to handle the objects asynchronously
        let tasks = locations.into_iter().map(|location| {
            let db = Arc::clone(&self.db);
            async move {
                let objects = db
                    .object()
                    .find_many(vec![object::locations::is(vec![location::uuid::equals(
                        location.uuid,
                    )])])
                    .exec()
                    .await?;

                // Handle each object asynchronously
                for object in objects {
                    //check if thumbnail already exists for this object
                    if object.thumbnail.unwrap_or(false) {
                        continue;
                    }

                    if let Some(_obj_name) = &object.obj_name {
                        match thumbnail::generate_thumbnail(&object) {
                            Ok(thumbnail) => {
                                if let Err(e) = self
                                    .db
                                    .object()
                                    .update(
                                        object::uuid::equals(object.uuid.clone()),
                                        vec![
                                            object::thumbnail::set(Some(true)),
                                            object::thumbnail_path::set(Some(
                                                thumbnail.to_str().unwrap().to_string(),
                                            )),
                                        ],
                                    )
                                    .exec()
                                    .await
                                {
                                    error!(
                                        "Database update error: {:?} for thumbnail path: {:?}",
                                        e,
                                        thumbnail.clone().to_str().unwrap()
                                    );
                                } else {
                                    self.emit_notification(CodexNotification::new(
                                        format!(
                                            "{}{}",
                                            "generated thumbnail".to_string(),
                                            thumbnail.clone().to_str().unwrap()
                                        ),
                                        NotificationType::ThumbnailGenerated,
                                    ))
                                    .await?
                                }
                            }
                            Err(e) => {
                                error!("Thumbnailer error: {:?}", e);
                            }
                        }
                    } else {
                        info!("Object missing name!");
                    }
                }

                Ok::<_, anyhow::Error>(())
            }
        });

        // Use try_join_all to run all tasks concurrently and await for all to finish
        let _ = try_join_all(tasks).await;

        Ok(())
    }

    pub async fn parse_objects(&self) -> Result<(), anyhow::Error> {
        //Get all collections belonging to this library:
        let collections = self
            .db
            .collection()
            .find_many(vec![collection::library::is(vec![library::id::equals(
                self.id,
            )])])
            .exec()
            .await?;

        //for each collection, get all locations:

        let locations = self
            .db
            .location()
            .find_many(vec![location::collection::is(vec![
                collection::id::in_vec(
                    collections
                        .iter()
                        .map(|collection| collection.id.clone())
                        .collect(),
                ),
            ])])
            .exec()
            .await?;

        let tasks = locations.into_iter().map(|location| {
                let db = Arc::clone(&self.db);
                async move {
                    let objects = db
                        .object()
                        .find_many(vec![object::locations::is(vec![location::uuid::equals(
                            location.uuid,
                        )])])
                        .exec()
                        .await?;
                    let object_tasks: Vec<_> = objects
                        .into_iter()
                        .filter(|object| !object.parsed.unwrap_or(false))
                        .map(|object| {
                            let db = Arc::clone(&self.db);
                            async move {
                                if let Some(_obj_name) = &object.obj_name {
                                    //We should check if the object is already parsed: 
                                    //If it is, we should skip it.

                                    let capture = object.clone();
                                    if (capture.parsed.unwrap_or(false)) {
                                        return Ok::<_, anyhow::Error>(());
                                    }
                                    let parsed_result = task::spawn_blocking(move || parsing::parse_object(&capture)).await?;
                                    match parsed_result {
                                        Ok(parsed) => {
                                            if let Err(e) = db
                                                .object()
                                                .update(
                                                    object::uuid::equals(object.uuid.clone()),
                                                    vec![
                                                        object::parsed::set(Some(true)),
                                                        object::parsed_path::set(Some(
                                                            parsed.to_str().ok_or_else(|| anyhow!("Failed to convert path to str"))?.to_string(),
                                                        )),
                                                    ],
                                                )
                                                .exec()
                                                .await
                                            {
                                                error!("Database update error: {:?} for parsed object {:?}", e, parsed.clone().into_os_string().to_string_lossy());
                                                self.emit_notification(CodexNotification::new(
                                                    format!("{}{}", "parse error".to_string(), parsed.clone().into_os_string().to_string_lossy()),
                                                    NotificationType::ParsingError,
                                                ))
                                                .await?
                                            } else {
                                                info!("Parsed object: {:?}", parsed.clone().into_os_string().to_string_lossy());
                                                self.emit_notification(CodexNotification::new(
                                                    format!("{}{}", "parsed object".to_string(), parsed.clone().into_os_string().to_string_lossy()),
                                                    NotificationType::ObjectParsed,
                                                ))
                                                .await?
                                            }
                                        }
                                        Err(e) => {
                                            error!("Parsing error: {:?}", e);
                                        }
                                    }
                                } else {
                                    error!("Object missing name: {:?}", object);
                                }
                        Ok::<_, anyhow::Error>(())
                            }
                        })
                        .collect();
                    let results = try_join_all(object_tasks).await?;
                                    Ok::<_, anyhow::Error>((results, ()))
                    }
        });
        let _ = try_join_all(tasks).await?;
        Ok(())
    }

    pub async fn get_objects(
        &self,
        library_uuid: String,
    ) -> Result<Vec<object::Data>, anyhow::Error> {
        let mut objects = Vec::new();
        let db_objects = self
            .db
            .object()
            .find_many(vec![object::library::is(vec![
                prisma::library::uuid::equals(library_uuid),
            ])])
            .exec()
            .await?;

        for object in db_objects {
            objects.push(object);
        }

        Ok(objects)
    }

    pub async fn get_locations(&self) -> Result<Vec<PathBuf>, anyhow::Error> {
        let mut locations = Vec::new();
        let db_locations = self.db.location().find_many(vec![]).exec().await?;

        for location in db_locations {
            locations.push(PathBuf::from(location.path));
        }

        Ok(locations)
    }

    // pub async fn update_collection_objects(&self, collection_id: i32) -> Result<(), anyhow::Error> {
    //     //get the collection
    //     let collection = self.db.collection().find_unique(collection::id::equals(collection_id)).exec().await?;
    //         //get the locations for the collection
    //     let locations = self.db.location().find_many(vec![location::collection::is(vec![collection::id::equals(collection_id)])]).exec().await?;

    //     for location in locations {
    //         let (changed_files, new_files, deleted_files) = self.check_location_for_changes(location).await?;
    //         //First we need to compare thje objects in the database with the objects in the file system.

    //         //Then we need to update the database with the changes.

    //         // If there are no changes, we don't need to do anything.
    //         if changed_files.is_empty() && new_files.is_empty() && deleted_files.is_empty() {
    //             return Ok(());

    //         }
    //     }

    //     Ok(())
    // }

    pub async fn check_for_changes(
        &self,
    ) -> Result<(Vec<object::Data>, Vec<PathBuf>, Vec<PathBuf>), anyhow::Error> {
        let changed_files = Vec::new();
        let mut new_files = Vec::new();
        let mut deleted_files = Vec::new();

        // Fetch all file paths from the library. Those are technically objects.
        let db_objects = self.db.object().find_many(vec![]).exec().await?;

        // Collect file paths from the file system
        let mut fs_file_paths = Vec::new();
        for location in self.get_locations().await? {
            // Assuming get_locations() returns a list of directories to scan
            for entry in fs::read_dir(location)? {
                let entry = entry?;
                let path = entry.path();
                if path.is_file() {
                    fs_file_paths.push(path);
                }
            }
        }

        info!(
            "Found {:?} files in the library",
            db_objects
                .iter()
                .map(|fp| fp.path.as_ref().unwrap())
                .collect::<Vec<&String>>()
        );
        info!("Found {:?} files in the file system", fs_file_paths);

        // Check for new and deleted files
        let db_objects_set: HashSet<PathBuf> = db_objects
            .iter()
            .map(|fp| Path::new(&fp.path.as_ref().unwrap()).to_path_buf())
            .collect();
        let fs_file_paths_set: HashSet<PathBuf> = fs_file_paths.into_iter().collect();

        for new_file in fs_file_paths_set.difference(&db_objects_set) {
            new_files.push(new_file.clone());
        }

        for deleted_file in db_objects_set.difference(&fs_file_paths_set) {
            deleted_files.push(deleted_file.clone());
        }

        Ok((changed_files, new_files, deleted_files))
    }

    pub async fn check_location_for_new_files(
        &self,
        location: &location::Data,
    ) -> Result<(Vec<PathBuf>), anyhow::Error> {
        let mut new_files = Vec::new();

        // Fetch all file paths from the library. Those are technically objects.
        let db_objects = self
            .db
            .object()
            .find_many(vec![object::locations::is(vec![location::id::equals(
                location.id,
            )])])
            .exec()
            .await?;

        // Collect file paths from the file system
        let mut fs_file_paths = Vec::new();
        for location in self.get_locations().await? {
            if location.is_dir() {
                for entry in fs::read_dir(location)? {
                    let entry = entry?;
                    let path = entry.path();
                    if path.is_file() {
                        fs_file_paths.push(path);
                    }
                }
            } else {
                fs_file_paths.push(location);
            }
        }

        info!(
            "Found {:?} files in the library",
            db_objects
                .iter()
                .map(|fp| fp.path.as_ref().unwrap())
                .collect::<Vec<&String>>()
        );
        info!("Found {:?} files in the file system", fs_file_paths);

        // Check for new and deleted files
        let db_objects_set: HashSet<PathBuf> = db_objects
            .iter()
            .map(|fp| Path::new(&fp.path.as_ref().unwrap()).to_path_buf())
            .collect();
        let fs_file_paths_set: HashSet<PathBuf> = fs_file_paths.into_iter().collect();

        for new_file in fs_file_paths_set.difference(&db_objects_set) {
            new_files.push(new_file.clone());
        }

        Ok(new_files)
    }

    //This library will check if the files in the library have changed since the last time the library was indexed.
    //If they have, it will update the library.
    //If they haven't, it will do nothing.

    pub async fn emit_notification(
        &self,
        notification: CodexNotification,
    ) -> Result<(), anyhow::Error> {
        self.notification_manager
            ._internal_emit(notification)
            .await?;

        Ok(())
    }
}
