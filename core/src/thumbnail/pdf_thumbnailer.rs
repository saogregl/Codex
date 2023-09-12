use anyhow::anyhow;
use codex_prisma::prisma::object::Data as ObjectData;
use log::info;

use crate::{config, object::Object as CodexObject, thumbnail::Thumbnailer};
use std::{path::PathBuf, process::Command, os::windows::process::CommandExt};

use super::ThumbnailerError;

pub struct PdfThumbnailer;

impl Thumbnailer for PdfThumbnailer {
    fn generate_thumbnail(&self, object: &ObjectData) -> Result<PathBuf, anyhow::Error> {
        let config = config::CodexConfig::new();
        //Call pdftoppm executable (assume it is in path) to generate text file

        let mut file_path = PathBuf::from(object.path.clone().expect("Object should have path"));
        info!(
            "Generating thumbnail for pdf: {}",
            file_path.to_str().unwrap()
        );

        let mut thumbnail_path_prefix = PathBuf::from(&config.data_dir).join(object.uuid.clone());
        thumbnail_path_prefix.set_extension("");

        //get target triple suffix for pdftoppm
        let target_triple = std::env::consts::ARCH.to_string() + "-" + &std::env::consts::OS;
        let target_triple = "x86_64-pc-windows-msvc".to_string();

        let output = Command::new(format!("./{}.exe", "pdftoppm"))
            .args([
                "-singlefile",
                "-f",
                "1",
                "-r",
                "-q",
                "72",
                "-jpeg",
                "-jpegopt",
                "quality=90",
                file_path.to_str().unwrap(),
                thumbnail_path_prefix.to_str().unwrap(),
            ])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .spawn()?
            .wait()?;

        if !output.success() {
            return Err(anyhow!(ThumbnailerError::CommandFailed(output)));
        }

        let thumbnail_path = thumbnail_path_prefix.with_extension("jpg");

        Ok(PathBuf::from(&thumbnail_path))
    }
}
