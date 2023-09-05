use codex_prisma::prisma::object::Data as ObjectData;
use std::path::PathBuf;

use log::info;

// Re-export PDF, PowerPoint, and Excel parsers from their respective files
pub use self::pdf_thumbnailer::PdfThumbnailer;
// pub use self::powerpoint_parser::PowerPointParser;
// pub use self::excel_parser::ExcelParser;

// Include sub-modules
mod pdf_thumbnailer;
// mod powerpoint_parser;
// mod excel_parser;

use crate::{fs_utils::extension_to_object_type, object::ObjectType};

#[derive(thiserror::Error, Debug)]
pub enum ThumbnailerError {
    #[error("Failed to generate Thumbnail {0}")]
    ParserError(String),
    #[error("Unsupported object type: {0}")]
    UnsupportedObjectType(ObjectType),
    #[error("Object name is missing")]
    MissingObjectName,
    #[error("Command failed with status: {0}")]
    CommandFailed(std::process::ExitStatus),
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// Define the Thumbnailer trait
pub trait Thumbnailer {
    fn generate_thumbnail(&self, object: &ObjectData) -> Result<PathBuf, anyhow::Error>;
}

// Implement the trait for specific file types

// For example, ImageThumbnailer implementation:
struct ImageThumbnailer;
impl Thumbnailer for ImageThumbnailer {
    fn generate_thumbnail(&self, object: &ObjectData) -> Result<PathBuf, anyhow::Error> {
        info!(
            "Generating thumbnail for image: {}",
            object.obj_name.clone().expect("Object should have name")
        );

        Err(anyhow::anyhow!(ThumbnailerError::UnsupportedObjectType(
            ObjectType::Image,
        )))
    }
}

// Implement the trait for specific file types

struct VideoThumbnailer;
impl Thumbnailer for VideoThumbnailer {
    fn generate_thumbnail(&self, object: &ObjectData) -> Result<PathBuf, anyhow::Error> {
        info!(
            "Generating thumbnail for video: {}",
            object.obj_name.clone().expect("Object should have name")
        );
        // ...
        Err(anyhow::anyhow!(ThumbnailerError::UnsupportedObjectType(
            ObjectType::Video,
        )))
    }
}

// Intermediate function to dispatch the call to the appropriate thumbnailer
pub fn generate_thumbnail_for_object(object: &ObjectData) -> Result<PathBuf, anyhow::Error> {
    let object_type = extension_to_object_type(
        &object
            .clone()
            .extension
            .expect("No extension found for file"),
    );
    match object_type {
        ObjectType::Image => {
            let thumbnailer = ImageThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }
        ObjectType::Document => {
            let thumbnailer = PdfThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }
        ObjectType::Video => {
            let thumbnailer = VideoThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }

        _ => {
            info!(
                "Thumbnail generation not supported for object type: {:?}, {:?}",
                object.extension,
                object.obj_name.clone().expect("Object should have name")
            );
            Err(anyhow::anyhow!(ThumbnailerError::UnsupportedObjectType(
                object_type
            )))
        }
    }
}

pub fn generate_thumbnail(object: &ObjectData) -> Result<PathBuf, anyhow::Error> {
    //Name is a string like document_name.extension. We need to extract the extension to determine the object type

    let name_path = PathBuf::from(object.path.clone().expect("Object should have path"));

    // Extract the extension using the `extension` method
    let extension = object
        .extension
        .clone()
        .expect("Object should have extension");

    let obj_type = extension_to_object_type(&extension);

    match obj_type {
        ObjectType::Image => {
            let thumbnailer = ImageThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }
        ObjectType::Document => {
            let thumbnailer = PdfThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }
        ObjectType::Video => {
            let thumbnailer = VideoThumbnailer;
            thumbnailer.generate_thumbnail(object)
        }

        _ => {
            println!(
                "Thumbnail generation not supported for object type: {:?}, {:?}",
                obj_type, object.obj_name
            );
            Err(anyhow::anyhow!(ThumbnailerError::UnsupportedObjectType(
                obj_type
            )))
        }
    }
}
