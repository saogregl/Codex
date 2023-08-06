use std::path::PathBuf;

use super::Library;
use crate::{fs_utils, object::Object, parsing, thumbnail};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use tantivy::{
    schema::{Schema, STORED, TEXT},
    Index,
};
use tempfile::TempDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocalLibrary {
    pub id: i32,
    pub name: String,
    pub objects: Vec<Object>,
    pub path: String,
}

fn objects_to_set(objects: &Vec<Object>) -> HashSet<Object> {
    objects.iter().cloned().collect()
}

fn has_library_changed(old_objects: &Vec<Object>, new_objects: &Vec<Object>) -> bool {
    let old_set = objects_to_set(old_objects);
    let new_set = objects_to_set(new_objects);
    old_set != new_set
}

impl LocalLibrary {
    pub fn get_all_objects(&self) -> &[Object] {
        &self.objects
    }

    fn deserialize_library_from_file(
        file_path: &str,
    ) -> Result<LocalLibrary, Box<dyn std::error::Error>> {
        let json = std::fs::read_to_string(file_path)?;
        let library: LocalLibrary = serde_json::from_str(&json)?;
        Ok(library)
    }

    fn has_library_changed(old_objects: &Vec<Object>, new_objects: &Vec<Object>) -> bool {
        let old_set = objects_to_set(old_objects);
        let new_set = objects_to_set(new_objects);
        old_set != new_set
    }
}

impl Library for LocalLibrary {
    fn new(
        id: i32,
        name: String,
        path: String,
    ) -> Result<LocalLibrary, Box<dyn std::error::Error>> {
        //We need to check if the library is already indexed.
        //If it is, we'll load the library from the database file.
        //If it isn't, we'll index the library and write it to the database file.

        //We'll start by checking if the library is already indexed.
        //We'll use the library name as the file name.
        let file_name = format!("{}.json", name);
        let file_path = format!("{}/{}", path, file_name);

        //If the file exists, we'll deserialize the library from the file and return it.
        if std::path::Path::new(&file_path).exists() {
            println!("Library already indexed. Loading from file.");
            let json = std::fs::read_to_string(file_path.clone()).unwrap();
            let mut lib: LocalLibrary = serde_json::from_str(&json).unwrap();

            //Before returning, we also need to check for any changes in the library.
            //We'll do this by checking if any objects have been added or removed.
            //If any objects have been added or removed, we'll update the library and write it to the database file.

            //First, we'll get the objects from the library.
            let objects = fs_utils::get_all_objects(&lib);
            lib.update_library();

            // Then we'll check if the number of objects has changed.
            // TODO: This can be improved by checking if the objects are the same.
            if lib.objects.len() != objects.len() {
                //If it has, we'll update the library and write it to the database file.
                println!("Library has changed. Updating and writing to file.");
                let mut lib = lib.clone();
                lib.objects = objects.clone();
                let json = serde_json::to_string(&lib).unwrap();
                std::fs::write(file_path, json).unwrap();
                //Also, update the library.
            }

            //Finally, we'll return the library.

            return Ok(lib);
        }

        //If the file doesn't exist, we'll create a new library and index it.

        let mut lib = LocalLibrary {
            id,
            name,
            path,
            objects: Vec::new(),
        };
        lib.update_library();
        Ok(lib)
    }

    fn update_library(&mut self) {
        self.index_objects();
        self.generate_thumbnails();
        self.parse_objects();
    }

    fn index_objects(&mut self) {
        //When indexing, we should check if the object is already indexed.
        //Indexing should write the library structure, including objects to the database file.
        //Since we don't have a database yet, we'll just write to a JSON taking advantage of serde serialize trait.

        //First, we find all objects in the path and create the objects.
        self.objects = fs_utils::get_all_objects(self);

        //Then we'll write it to a JSON file for now.
        //We'll use the library name as the file name.
        let file_name = format!("{}.json", self.name);
        let file_path = format!("{}/{}", self.path, file_name);

        //Now we'll serialize the library to JSON and write it to the file.
        let json = serde_json::to_string(&self).unwrap();
        std::fs::write(file_path, json).unwrap();

        //Finally, we'll update the indexed field of the objects.

        for object in &mut self.objects {
            object.indexed = true;
        }
    }
    fn generate_thumbnails(&mut self) {
        println!("Generating thumbnails for library: {}", self.name);

        self.objects.par_iter_mut().for_each(|object| {
            let path = PathBuf::from(&object.path.path);

            //Look for thumbnails in the thumbnails folder:
            let thumbnails_folder = format!("{}/thumbnails", self.path);
            let mut thumbnail_path = PathBuf::from(&thumbnails_folder);
            thumbnail_path.push(&object.path.path);
            thumbnail_path.set_extension("jpg");

            if std::path::Path::new(&thumbnail_path).exists() {
                println!("Thumbnail already created at: {:?}", thumbnail_path);
                return;
            }

            thumbnail::generate_thumbnail_for_object(object);
        });
    }

    fn parse_objects(&mut self) {
        //check if text file already exists:

        println!("Parsing objects for library: {}", self.name);
        self.objects.par_iter_mut().for_each(|object| {
            let path = PathBuf::from(&object.path.path);
            let mut text_path = PathBuf::from(&object.path.path);
            text_path.set_extension("txt");

            if std::path::Path::new(&text_path).exists() {
                println!("File already created at: {:?}", text_path);
                return;
            }

            let _result = parsing::parse_for_object(object);
        });
    }
}
