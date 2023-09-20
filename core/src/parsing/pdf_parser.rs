use crate::config::CodexConfig;
use codex_prisma::prisma::object::Data as ObjectData;
use log::{error, info};

use std::{path::PathBuf, process::Command, os::windows::process::CommandExt};

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

        let target_triple = std::env::consts::ARCH.to_string() + "-" + &std::env::consts::OS;
        let target_triple = "x86_64-pc-windows-msvc".to_string();



        let output = Command::new(format!("./{}.exe", "pdftotext"))
            .args(&[
                "-enc",
                "UTF-8",
                "-q",
                pdf_path.as_str(),
                text_path
                    .to_str()
                    .expect("We need a valid path to text file"),
            ])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .spawn()?
            .wait()?;

        if !output.success() {
            error!(
                "pdftotext failed to parse file {:?} with status: {}",
                pdf_path.as_str(),
                output
            );
            return Err(ParsingError::CommandFailed(output));
        }

        Ok(text_path)
    }
}
