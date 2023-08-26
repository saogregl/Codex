use crate::{
    config::{self, CodexConfig},
    object::Object as CodexObject,
};
use codex_prisma::prisma::object::Data as ObjectData;

use std::{
    path::PathBuf,
    process::{Command, Stdio},
};


use super::{Parser, ParsingError};

pub struct PdfParser;

impl Parser for PdfParser {
    fn parse_object(&self, file: &ObjectData) -> Result<PathBuf, ParsingError> {
        let config = CodexConfig::new();
        //get absolute path of pdf file
        let mut pdf_path = PathBuf::from(&config.data_dir).join(
            file.obj_name
                .clone()
                .ok_or(ParsingError::MissingObjectName)?,
        );
        pdf_path.set_extension("pdf");

        let mut text_path = PathBuf::from(&config.data_dir).join(&file.uuid);
        text_path.set_extension("txt");

        //Call pdfToText executable (assume it is in path) to generate text file
        let output = Command::new("pdftotext")
            .args(&[
                "-enc",
                "UTF-8",
                pdf_path.to_str().expect("We need a valid path to pdf file"),
                text_path.to_str().expect("We need a valid path to text file"),
            ])
            .output()?;

        if !output.status.success() {
            return Err(ParsingError::CommandFailed(output.status));
        }

        Ok(text_path)
    }
}
