use std::{path::PathBuf};

use log::info;

// Re-export PDF, PowerPoint, and Excel parsers from their respective files
pub use self::pdf_thumbnailer::PdfThumbnailer;
// pub use self::powerpoint_parser::PowerPointParser;
// pub use self::excel_parser::ExcelParser;

// Include sub-modules
mod pdf_thumbnailer;
// mod powerpoint_parser;
// mod excel_parser;


use crate::{object::{Object, ObjectType}, fs_utils::extension_to_object_type};

// Define the Thumbnailer trait
pub trait Thumbnailer {
    fn generate_thumbnail_object(&self, object: &mut Object) -> Option<(Object, Vec<u8>)>;
    fn generate_thumbnail(&self, name: &str, path: PathBuf) -> Result<(), Box<dyn std::error::Error>>;
}

// Implement the trait for specific file types

// For example, ImageThumbnailer implementation:
struct ImageThumbnailer;
impl Thumbnailer for ImageThumbnailer {
    fn generate_thumbnail_object(&self, object: &mut Object) -> Option<(Object, Vec<u8>)> {
        info!("Generating thumbnail for image: {}", object.get_name());
        // Implementation for generating image thumbnails
        // ...
        // Assuming thumbnail_data is a Vec<u8> containing the thumbnail
        None
    }
    fn generate_thumbnail(&self, name: &str, _path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        info!("Generating thumbnail for image: {}", name);
        // Implementation for generating image thumbnails
        // ...
        Ok(())
    }
}

// Implement the trait for specific file types

struct VideoThumbnailer;
impl Thumbnailer for VideoThumbnailer {
    fn generate_thumbnail_object(&self, object: &mut Object) -> Option<(Object, Vec<u8>)> {
        println!("Generating thumbnail for video: {}", object.get_name());
        // ...
        None
    }
    fn generate_thumbnail(&self, name: &str, _path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        println!("Generating thumbnail for video: {}", name);
        // ...
        Ok(())
    }
}

// Intermediate function to dispatch the call to the appropriate thumbnailer
pub fn generate_thumbnail_for_object(object: &mut Object) -> Option<(Object, Vec<u8>)> {
    match object.object_type {
        ObjectType::Image => {
            let thumbnailer = ImageThumbnailer;
            thumbnailer.generate_thumbnail_object(object)
        }
        ObjectType::Document => {
            let thumbnailer = PdfThumbnailer;
            thumbnailer.generate_thumbnail_object(object)
        }
        ObjectType::Video => {
            let thumbnailer = VideoThumbnailer;
            thumbnailer.generate_thumbnail_object(object)
        }

        _ => {
            println!(
                "Thumbnail generation not supported for object type: {:?}, {:?}",
                object.object_type,
                object.get_name()
            );
            None
        }
    }


}

pub fn generate_thumbnail(name: &str, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {

    //Name is a string like document_name.extension. We need to extract the extension to determine the object type

    let name_path = PathBuf::from(name);
    
    // Extract the extension using the `extension` method
    let extension = name_path.extension()
        .and_then(|os_str| os_str.to_str())
        .ok_or("No extension found in name")?;


    let obj_type = extension_to_object_type(extension);

    info!("Generating thumbnail for object: {:?}, {:?} and saving on path {:?} inside thumbnails folder", obj_type, name, path);

    match obj_type {
        ObjectType::Image => {
            let thumbnailer = ImageThumbnailer;
            thumbnailer.generate_thumbnail(name, path)
        }
        ObjectType::Document => {
            let thumbnailer = PdfThumbnailer;
            thumbnailer.generate_thumbnail(name, path)
        }
        ObjectType::Video => {
            let thumbnailer = VideoThumbnailer;
            thumbnailer.generate_thumbnail(name, path)
        }

        _ => {
            println!(
                "Thumbnail generation not supported for object type: {:?}, {:?}",
                obj_type,
                name
            );
            Ok(()) 
        }
    }

    
}
