// Re-export PDF, PowerPoint, and Excel parsers from their respective files
pub use self::pdf_thumbnailer::PdfThumbnailer;
// pub use self::powerpoint_parser::PowerPointParser;
// pub use self::excel_parser::ExcelParser;

// Include sub-modules
mod pdf_thumbnailer;
// mod powerpoint_parser;
// mod excel_parser;


use crate::object::{Object, ObjectType};

// Define the Thumbnailer trait
pub trait Thumbnailer {
    fn generate_thumbnail(&self, object: &mut Object) -> Option<(Object, Vec<u8>)>;
}

// Implement the trait for specific file types

// For example, ImageThumbnailer implementation:
struct ImageThumbnailer;
impl Thumbnailer for ImageThumbnailer {
    fn generate_thumbnail(&self, object: &mut Object) -> Option<(Object, Vec<u8>)> {
        println!("Generating thumbnail for image: {}", object.get_name());
        // Implementation for generating image thumbnails
        // ...
        // Assuming thumbnail_data is a Vec<u8> containing the thumbnail
        None
    }
}

// Implement the trait for specific file types

struct VideoThumbnailer;
impl Thumbnailer for VideoThumbnailer {
    fn generate_thumbnail(&self, object: &mut Object) -> Option<(Object, Vec<u8>)> {
        println!("Generating thumbnail for video: {}", object.get_name());
        // ...
        None
    }
}

// Intermediate function to dispatch the call to the appropriate thumbnailer
pub fn generate_thumbnail_for_object(object: &mut Object) -> Option<(Object, Vec<u8>)> {
    match object.object_type {
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
                object.object_type,
                object.get_name()
            );
            None
        }
    }
}
