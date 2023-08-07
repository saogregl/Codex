use crate::{object::Object as CodexObject, parsing::Parser};
use std::collections::HashMap;
use std::fs;
use std::time::SystemTime;
use std::{path::PathBuf, process::Command};

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
                "-enc",
                "UTF-8",
                path.to_str().unwrap(),
                parsed_path.to_str().unwrap(),
            ])
            .output()
            .unwrap();

        Ok(())
    }
}
