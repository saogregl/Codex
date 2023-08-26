use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use crate::{fs_utils::extract_location_path, parsing, thumbnail};

use chrono::{TimeZone, Utc};
use codex_prisma::prisma::{self, library, location, PrismaClient};
use futures::future::try_join_all;
use log::{error, info};
use rayon::prelude::*;
use std::collections::HashSet;
use uuid::Uuid;

use codex_prisma::prisma::object;

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
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub db: Arc<PrismaClient>,
}

impl LocalLibrary {
    pub async fn new(
        id: Uuid,
        name: String,
        description: Option<String>,
        db: Arc<PrismaClient>,
    ) -> Result<Arc<Self>, Box<dyn std::error::Error>> {
        //This library is not meant to be used to create new library objects.
        //It's meant to be used to load existing library objects from the database.
        //If the library doesn't exist in the database, we'll return an error.

        //To create new library objects, refer to the libraryManager.

        // Double check that the library exists in the database.
        let library = db
            .library()
            .find_unique(prisma::library::uuid::equals(id.to_string()))
            .exec()
            .await?;

        info!("Loaded library: {:?}", library);

        if library.is_none() {
            return Err("Library not found".into());
        }

        let library = LocalLibrary {
            id,
            name,
            description,
            db,
        };

        library.index_objects().await?;

        Ok(Arc::new(library))
    }

    pub async fn add_location(&self, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        let path = path.to_str().unwrap();

        let this_library_id = self.id.to_string();

        let location_db = self
            .db
            .location()
            .create(
                path.to_string(),
                vec![location::library::connect(library::uuid::equals(
                    this_library_id.clone(),
                ))],
            )
            .exec()
            .await?;

        //Add all the files in the location to the library.
        let mut files = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_file() {
                files.push(path);
            }
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

    pub async fn get_library(&self) -> Result<prisma::library::Data, Box<dyn std::error::Error>> {
        let library = self
            .db
            .library()
            .find_unique(prisma::library::uuid::equals(self.id.to_string()))
            .exec()
            .await?;

        if let Some(library) = library {
            Ok(library)
        } else {
            Err("Library not found".into())
        }
    }

    pub async fn index_objects(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("Indexing objects for library: {}", self.name);
        let (changed_files, new_files, deleted_files) = self.check_for_changes().await?;
        info!("Changed files: {:?}", changed_files);
        info!("New files: {:?}", new_files);
        info!("Deleted files: {:?}", deleted_files);

        // If there are no changes, we don't need to do anything.
        if changed_files.is_empty() && new_files.is_empty() && deleted_files.is_empty() {
            return Ok(());
        }

        let library = self.get_library().await?;
        let _library_uuid = &library.uuid;

        // If there are changes, we'll update the library.
        // We'll start by deleting the deleted files.

        //TODO: Clean this up later:
        for file in deleted_files {
            self.db
                .object()
                .delete_many(vec![object::path::equals(Some(
                    file.to_str().unwrap().to_string(),
                ))])
                .exec()
                .await?;
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

        // We'll then add the new files.
        // Step 1: Group files by location path
        let mut files_by_location: HashMap<String, Vec<PathBuf>> = HashMap::new();
        for file in new_files {
            match extract_location_path(file.clone()) {
                Some(location_path) => {
                    files_by_location
                        .entry(location_path)
                        .or_insert_with(Vec::new)
                        .push(file);
                }
                None => {
                    error!(
                        "Could not determine location for file: {}",
                        file.to_str().unwrap_or("Invalid Path")
                    );
                }
            }
        }

        // Step 2: Fetch locations from the database
        let location_paths: Vec<String> = files_by_location.keys().cloned().collect();
        let locations = self
            .db
            .location()
            .find_many(vec![location::path::in_vec(location_paths)])
            .exec()
            .await?;

        // Step 3: Insert new files
        for location in locations {
            if let Some(files) = files_by_location.get(&location.path) {
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
                            library::uuid::equals(self.id.to_string()),
                            location::uuid::equals(location.uuid.clone()),
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
            }
        }

        Ok(())
    }

    pub async fn generate_thumbnails(&self) -> Result<(), Box<dyn std::error::Error>> {
        let locations = self
            .db
            .location()
            .find_many(vec![location::library::is(vec![
                prisma::library::uuid::equals(self.id.to_string()),
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
                                    error!("Database update error: {:?}", e);
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

                Ok::<_, Box<dyn std::error::Error>>(())
            }
        });

        // Use try_join_all to run all tasks concurrently and await for all to finish
        let _ = try_join_all(tasks).await;

        Ok(())
    }

    pub async fn parse_objects(&self) -> Result<(), Box<dyn std::error::Error>> {
        let locations = self
            .db
            .location()
            .find_many(vec![location::library::is(vec![
                prisma::library::uuid::equals(self.id.to_string()),
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
                    if let Some(_obj_name) = &object.obj_name {
                        match parsing::parse_object(&object) {
                            Ok(parsed) => {
                                if let Err(e) = self
                                    .db
                                    .object()
                                    .update(
                                        object::uuid::equals(object.uuid.clone()),
                                        vec![
                                            object::parsed::set(Some(true)),
                                            object::parsed_path::set(Some(
                                                parsed.to_str().unwrap().to_string(),
                                            )),
                                        ],
                                    )
                                    .exec()
                                    .await
                                {
                                    error!("Database update error: {:?}", e);
                                }
                            }
                            Err(e) => {
                                error!("Parsing error: {:?}", e);
                            }
                        }
                    } else {
                        info!("Object missing name!");
                    }
                }

                Ok::<_, Box<dyn std::error::Error>>(())
            }
        });

        // Use try_join_all to run all tasks concurrently and await for all to finish
        let _ = try_join_all(tasks).await;

        Ok(())
    }

    pub async fn get_objects(
        &self,
        library_uuid: String,
    ) -> Result<Vec<object::Data>, Box<dyn std::error::Error>> {
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

    pub async fn get_locations(&self) -> Result<Vec<PathBuf>, Box<dyn std::error::Error>> {
        let mut locations = Vec::new();
        let db_locations = self.db.location().find_many(vec![]).exec().await?;

        for location in db_locations {
            locations.push(PathBuf::from(location.path));
        }

        Ok(locations)
    }

    pub async fn check_for_changes(
        &self,
    ) -> Result<(Vec<object::Data>, Vec<PathBuf>, Vec<PathBuf>), Box<dyn std::error::Error>> {
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

    //This library will check if the files in the library have changed since the last time the library was indexed.
    //If they have, it will update the library.
    //If they haven't, it will do nothing.
}
