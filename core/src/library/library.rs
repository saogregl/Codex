use std::{
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use crate::{
    fs_utils::extension_to_object_type,
    object::{Object, ObjectType},
    parsing, thumbnail,
};

use super::Library;
use chrono::{TimeZone, Utc};
use codex_prisma::prisma::{self, library, location, PrismaClient};
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

        let library = db
            .library()
            .find_unique(prisma::library::uuid::equals(id.to_string()))
            .exec()
            .await?;

        if library.is_none() {
            return Err("Library not found".into());
        }

        let mut library = LocalLibrary {
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

        self.db
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
            let metadata = fs::metadata(&file_path)?;
            let date_modified = metadata
                .modified()?
                .duration_since(SystemTime::UNIX_EPOCH)?
                .as_secs();
            let extension = file.extension().unwrap().to_str().unwrap();
            let object = self
                .db
                .object()
                .create(vec![
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
                    object::library::connect(library::uuid::equals(this_library_id.clone())),
                ])
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
            return Ok(library);
        } else {
            return Err("Library not found".into());
        }
    }

    pub async fn index_objects(&self) -> Result<(), Box<dyn std::error::Error>> {
        let (changed_files, new_files, deleted_files) = self.check_for_changes().await?;

        // If there are no changes, we don't need to do anything.
        if changed_files.is_empty() && new_files.is_empty() && deleted_files.is_empty() {
            return Ok(());
        }

        let library = self.get_library().await?;
        let library_uuid = &library.uuid;

        // If there are changes, we'll update the library.
        // We'll start by deleting the deleted files.
        for file in deleted_files {
            self.db
                .object()
                .delete(object::uuid::equals(file.uuid))
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
        for file in new_files {
            let file_name = file.file_name().unwrap().to_str().unwrap();
            let file_path = file.to_str().unwrap();
            let metadata = fs::metadata(&file_path)?;
            let date_modified = metadata
                .modified()?
                .duration_since(SystemTime::UNIX_EPOCH)?
                .as_secs();
            let extension = file.extension().unwrap().to_str().unwrap();
            let object = self
                .db
                .object()
                .create(vec![
                    object::uuid::set(Uuid::new_v4().to_string()),
                    object::obj_name::set(Some(file_name.to_string())),
                    object::path::set(Some(file_path.to_string())),
                    object::extension::set(Some(extension.to_string())),
                    object::date_modified::set(Some(
                        Utc.timestamp_millis_opt(date_modified.try_into().unwrap())
                            .unwrap()
                            .into(),
                    )),
                ])
                .exec()
                .await?;
        }

        Ok(())
    }

    pub async fn generate_thumbnails(&self) -> Result<(), Box<dyn std::error::Error>> {
        let objects = self.get_objects(self.id.to_string()).await?;

        for object in objects {
            // Find location of object
            let path = PathBuf::from(&object.path.clone().expect("every object needs a path"));

            //Look for thumbnails in the thumbnails folder:
            let thumbnails_folder = "./thumbnails".to_string();
            let mut thumbnail_path = PathBuf::from(&thumbnails_folder);
            thumbnail_path.push(&object.path.expect("every object needs a path"));
            thumbnail_path.set_extension("jpg");

            if std::path::Path::new(&thumbnail_path).exists() {
                println!("Thumbnail already created at: {:?}", thumbnail_path);
                continue;
            }

            thumbnail::generate_thumbnail(&object.obj_name.unwrap(), path)?;
        }

        Ok(())
    }

    pub async fn parse_objects(&self) -> Result<(), Box<dyn std::error::Error>> {
        //When parsing, we should check if the object is already parsed.
        //Parsing should write the library structure, including objects to the database file.

        //First, we find all objects in the path and create the objects.
        let objects = self.get_objects(self.id.to_string()).await?;

        println!("Parsing objects for library: {}", self.name);
        objects.par_iter().for_each(|obj| {
            let path = PathBuf::from(&obj.path.clone().unwrap());
            let mut text_path = PathBuf::from(&obj.path.clone().unwrap());
            text_path.set_extension("txt");

            if std::path::Path::new(&text_path).exists() {
                println!("File already created at: {:?}", text_path);
                return;
            }
            let obj_helper: Object = Object::new(
                obj.id.clone(),
                obj.obj_name.clone().unwrap(),
                obj.extension.clone().unwrap(),
                obj.obj_name.clone().unwrap(),
                extension_to_object_type(&obj.extension.clone().unwrap()),
                std::fs::metadata(&obj.obj_name.clone().unwrap()).unwrap(),
                false,
            );

            let parse_result = parsing::parse_for_object(&obj_helper);
        });

        for object in objects {
            self.db
                .object()
                .update(
                    object::uuid::equals(object.uuid),
                    vec![object::indexed::set(Some(true))],
                )
                .exec()
                .await?;
        }

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
    ) -> Result<(Vec<object::Data>, Vec<PathBuf>, Vec<object::Data>), Box<dyn std::error::Error>>
    {
        let mut changed_files = Vec::new();
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
        // Check for new and deleted files
        let db_objects_set: HashSet<PathBuf> = db_objects
            .iter()
            .map(|fp| Path::new(&fp.path.as_ref().unwrap()).to_path_buf())
            .collect();
        let fs_file_paths_set: HashSet<PathBuf> = fs_file_paths.into_iter().collect();

        for new_file in fs_file_paths_set.difference(&db_objects_set) {
            new_files.push(new_file.clone());
        }

        for db_object_file_path in db_objects.iter() {
            let path_name = &db_object_file_path
                .path
                .as_ref()
                .expect("every object needs a path");
            let path = Path::new(path_name);
            if !db_objects_set.contains(&path.to_path_buf()) {
                deleted_files.push(db_object_file_path.clone());
                continue;
            }

            // Check for modifications to existing files
            let metadata = fs::metadata(&path)?;
            let fs_modified_time = metadata
                .modified()?
                .duration_since(SystemTime::UNIX_EPOCH)?
                .as_secs();
            let db_modified_time = db_object_file_path
                .date_modified
                .map(|d| d.timestamp())
                .unwrap_or(0);

            if fs_modified_time != db_modified_time as u64 {
                changed_files.push(db_object_file_path.clone());
            }
        }

        Ok((changed_files, new_files, deleted_files))
    }

    //This library will check if the files in the library have changed since the last time the library was indexed.
    //If they have, it will update the library.
    //If they haven't, it will do nothing.
}
