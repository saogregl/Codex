use crate::{object::Object as CodexObject, thumbnail::Thumbnailer};
use std::{path::PathBuf, process::Command};

pub struct PdfThumbnailer;

impl Thumbnailer for PdfThumbnailer {
    fn generate_thumbnail_object(
        &self,
        object: &mut CodexObject,
    ) -> Option<(CodexObject, Vec<u8>)> {
        //Call pdfToText executable (assume it is in path) to generate text file
        //Todo: Make the path to the thumbnail folder configurable in the library object.
        let path = PathBuf::from(&object.path.path);
        let thumbnails_folder = format!("./thumbnails/{}", object.get_name());
        let mut thumbnail_path = PathBuf::from(&thumbnails_folder);
        thumbnail_path.set_extension("");

        Command::new("pdftoppm")
            .args([
                "-singlefile",
                "-f",
                "1",
                "-r",
                "72",
                "-jpeg",
                "-jpegopt",
                "quality=90",
                path.to_str().unwrap(),
                thumbnail_path.to_str().unwrap(),
            ])
            .output()
            .unwrap();

        object.thumbnail_path = Some(thumbnail_path.to_str().unwrap().to_string());
        None
    }
    fn generate_thumbnail(&self, name: &str, path: PathBuf) -> Result<(), Box<dyn std::error::Error>> {
        //Call pdfToText executable (assume it is in path) to generate text file
        let thumbnails_folder = format!("./thumbnails/{}", name);
        let mut thumbnail_path = PathBuf::from(&thumbnails_folder);
        thumbnail_path.set_extension("");

        Command::new("pdftoppm")
            .args([
                "-singlefile",
                "-f",
                "1",
                "-r",
                "72",
                "-jpeg",
                "-jpegopt",
                "quality=90",
                path.to_str().unwrap(),
                thumbnail_path.to_str().unwrap(),
            ])
            .output()
            .unwrap();

        Ok(())
    }
}
