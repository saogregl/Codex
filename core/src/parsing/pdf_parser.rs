use crate::{object::Object as CodexObject};

use std::{path::PathBuf, process::{Command, Stdio}};

use super::Parser;

pub struct PdfParser;

impl Parser<Vec<u8>> for PdfParser {
    fn parse(&self, object: &CodexObject) -> Result<(), Vec<u8>> {
        //get absolute path of pdf file
        let path = PathBuf::from(&object.path.path);
        let parsed_folder = format!("./parsed/{}", object.get_name());
        let mut parsed_path = PathBuf::from(&parsed_folder);
        parsed_path.set_extension("txt");

        println!("Parsed path: {:?}", parsed_path);

        //Call pdfToText executable (assume it is in path) to generate text file
        Command::new("pdftotext")
            .args([
                "-l",
                "-enc",
                "UTF-8",
                path.to_str().unwrap(),
                parsed_path.to_str().unwrap(),
            ])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .output()
            .unwrap();

        Ok(())
    }
    fn parse_file(&self, file_name: String, parsed_path: PathBuf) -> Result<(), Vec<u8>> {
        //get absolute path of pdf file
        let mut pdf_path = parsed_path.clone().join(file_name.clone());
        pdf_path.set_extension("pdf");

        let mut text_path = parsed_path.clone().join("parsed").join(file_name.clone());
        text_path.set_extension("txt");

        //Call pdfToText executable (assume it is in path) to generate text file
        Command::new("pdftotext")
            .args([
                "-l",
                "-enc",
                "UTF-8",
                pdf_path.to_str().unwrap(),
                text_path.to_str().unwrap(),
            ])
            .output()
            .unwrap();

        Ok(())
    }
}
