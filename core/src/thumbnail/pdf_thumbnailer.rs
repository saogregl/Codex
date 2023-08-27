use codex_prisma::prisma::object::Data as ObjectData;
use log::info;

use crate::{config, object::Object as CodexObject, thumbnail::Thumbnailer};
use std::{path::PathBuf, process::Command};

use super::ThumbnailerError;

pub struct PdfThumbnailer;

impl Thumbnailer for PdfThumbnailer {
    fn generate_thumbnail(
        &self,
        object: &ObjectData,
    ) -> Result<PathBuf, Box<dyn std::error::Error>> {
        let config = config::CodexConfig::new();
        //Call pdftoppm executable (assume it is in path) to generate text file

        let mut file_path = PathBuf::from(object.path.clone().expect("Object should have path"));
        info!(
            "Generating thumbnail for pdf: {}",
            file_path.to_str().unwrap()
        );

        let mut thumbnail_path_prefix = PathBuf::from(&config.data_dir).join(object.uuid.clone());
        thumbnail_path_prefix.set_extension("");

        let output = Command::new("pdftoppm")
            .args([
                "-singlefile",
                "-f",
                "1",
                "-r",
                "72",
                "-jpeg",
                "-jpegopt",
                "quality=90",
                file_path.to_str().unwrap(),
                thumbnail_path_prefix.to_str().unwrap(),
            ])
            .output()?;

        if !output.status.success() {
            return Err(Box::new(ThumbnailerError::CommandFailed(output.status)));
        }

        let thumbnail_path = thumbnail_path_prefix.with_extension("jpg");

        Ok(PathBuf::from(&thumbnail_path))
    }
}
