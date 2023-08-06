// Re-export PDF, PowerPoint, and Excel parsers from their respective files
pub use self::pdf_parser::PdfParser;
// pub use self::powerpoint_parser::PowerPointParser;
// pub use self::excel_parser::ExcelParser;

// Include sub-modules
mod pdf_parser;
// mod powerpoint_parser;
// mod excel_parser;

use std::path::Path;

use crate::object::{Object, ObjectType};

// Define the Parser trait
pub trait Parser<T> {
    fn parse(&self, object: &Object) -> Result<(), T>;
}

// Implement the trait for specific file types

// For example, ImageParser implementation:
struct ImageParser;
impl Parser<Vec<u8>> for ImageParser {
    fn parse(&self, object: &Object) -> Result<(), Vec<u8>> {
        println!("Parsing image: {}", object.get_name());
        // Implementation for generating image thumbnails
        // ...
        // Assuming thumbnail_data is a Vec<u8> containing the thumbnail
        Ok(())
    }
}

// Implement the trait for specific file types

struct VideoParser;
impl Parser<Vec<u8>> for VideoParser {
    fn parse(&self, object: &Object) -> Result<(), Vec<u8>> {
        println!("Parsing video: {}", object.get_name());
        // ...
        Ok(())
    }
}

// Intermediate function to dispatch the call to the appropriate Parser
pub fn parse_for_object(object: &Object) -> Result<(), Vec<u8>> {
    match object.object_type {
        ObjectType::Image => {
            let Parser = ImageParser;
            Parser.parse(object)
        }
        ObjectType::Document => {
            let Parser = PdfParser;
            Parser.parse(object)
        }
        ObjectType::Video => {
            let Parser = VideoParser;
            Parser.parse(object)
        }

        _ => {
            println!(
                "Parsing not supported for object type: {:?}, {:?}",
                object.object_type,
                object.get_name()
            );
            Ok(())
        }
    }
}
