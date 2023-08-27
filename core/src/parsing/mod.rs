use std::path::PathBuf;

use codex_prisma::prisma::object::Data as ObjectData;

use log::info;

pub use self::pdf_parser::PdfParser;
mod pdf_parser;

use crate::{
    config::CodexConfig,
    fs_utils::extension_to_object_type,
    object::{Object, ObjectType},
};

// The Xpdf tools use the following exit codes:
// 0 No error.
// 1 Error opening a PDF file.
// 2 Error opening an output file.
// 3 Error related to PDF permissions.
// 99 Other error.

#[derive(thiserror::Error, Debug)]
pub enum ParsingError {
    #[error("Failed to parse {0}")]
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

// Define the parser trait
pub trait Parser {
    fn parse_object(&self, file: &ObjectData) -> Result<PathBuf, ParsingError>;
}

// Implement the trait for specific file types

// For example, ImageParser implementation:
struct ImageParser;
impl Parser for ImageParser {
    fn parse_object(&self, _file: &ObjectData) -> Result<PathBuf, ParsingError> {
        Err(ParsingError::UnsupportedObjectType(ObjectType::Image))
    }
}

// Implement the trait for specific file types

struct VideoParser;
impl Parser for VideoParser {
    fn parse_object(&self, _file: &ObjectData) -> Result<PathBuf, ParsingError> {
        // ...
        Err(ParsingError::UnsupportedObjectType(ObjectType::Video))
    }
}

// Intermediate function to dispatch the call to the appropriate parser
pub fn parse_object(file: &ObjectData) -> Result<PathBuf, ParsingError> {
    let object_type =
        extension_to_object_type(&file.clone().extension.expect("No extension found for file"));

    match object_type {
        ObjectType::Image => {
            let parser = ImageParser;
            parser.parse_object(file)
        }
        ObjectType::Document => {
            let parser = PdfParser;
            parser.parse_object(file)
        }
        ObjectType::Video => {
            let parser = VideoParser;
            parser.parse_object(file)
        }

        _ => {
            info!("Unsupported object type: {:?}", object_type);
            //This should not stop the parsing process, just log it and continue
            Err(ParsingError::UnsupportedObjectType(object_type))
        }
    }
}
