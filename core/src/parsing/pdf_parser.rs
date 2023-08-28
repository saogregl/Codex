use crate::config::CodexConfig;
use codex_prisma::prisma::object::Data as ObjectData;
use log::{info, error};

use std::{path::PathBuf, process::Command};

use super::{Parser, ParsingError};

pub struct PdfParser;

impl Parser for PdfParser {
    fn parse_object(&self, file: &ObjectData) -> Result<PathBuf, ParsingError> {
        let config = CodexConfig::new();
        //get absolute path of pdf file
        let pdf_path = file.path.clone().expect("Object should have path");

        info!("Parsing pdf: {}", pdf_path);
        let mut text_path = PathBuf::from(&config.data_dir).join(&file.uuid);
        text_path.set_extension("txt");

        //Call pdfToText executable (assume it is in path) to generate text file
        let output = Command::new("pdftotext")
            .args(&[
                "-enc",
                "UTF-8",
                pdf_path.as_str(),
                text_path
                    .to_str()
                    .expect("We need a valid path to text file"),
            ])
            .output()?;

        if !output.status.success() {
            error!(
                "pdftotext failed to parse file {:?} with status: {}",
                pdf_path.as_str(),
                output.status
            );
            return Err(ParsingError::CommandFailed(output.status));
        }

        Ok(text_path)
    }
}
