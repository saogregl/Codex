use std::fs;

use crate::{object::{ObjectType, Object}, library::Library};
use crate::LocalLibrary;


pub fn get_all_files_dir(file_path: &str) -> Vec<String> {
    let mut files = Vec::new();
    let paths = fs::read_dir(file_path).unwrap();
    for path in paths {
        let path = path.unwrap().path();
        //TODO: Make parsed and thumbnails into ignored directories by default. 
        if path.is_dir() && path.to_str().unwrap() != "parsed" && path.to_str().unwrap() != "thumbnails" {
            println!("Path: {:?}", path);
            // files.append(&mut get_all_files_dir(path.to_str().unwrap()));
        } else {
            //get file name: 
            let filename = path.file_name().unwrap().to_str().unwrap().to_string();
            files.push(filename);
        }
    }
    files
}

//Get full metadata:
pub fn get_metadata(file_path: &str) -> std::io::Result<std::fs::Metadata> {
    let metadata = fs::metadata(file_path)?;
    Ok(metadata)
}

pub fn get_extension(file_path: &str) -> String {
    let file_path = file_path.to_string();
    let file_path = file_path.split(".").collect::<Vec<&str>>();
    let file_path = file_path[file_path.len() - 1];
    file_path.to_string()
}

pub fn extension_to_object_type(extension: &str) -> ObjectType {
    match extension {
        "txt" => ObjectType::Text,
        "png" => ObjectType::Image,
        "jpg" => ObjectType::Image,
        "jpeg" => ObjectType::Image,
        "exe" => ObjectType::Executable,
        "pdf" => ObjectType::Document,
        "obj" => ObjectType::Mesh,
        "rs" => ObjectType::Code,
        "mp4" => ObjectType::Video,
        "mp3" => ObjectType::Audio,
        "zip" => ObjectType::Compressed,
        "rar" => ObjectType::Compressed,
        "7z" => ObjectType::Compressed,
        _ => ObjectType::Unknown,
    }
}

