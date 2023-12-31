use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash, Default)]
pub enum ObjectType {
    #[default]
    Unknown,
    Document,
    Folder,
    Text,
    Image,
    Executable,
    Mesh,
    Code,
    Video,
    Audio,
    Compressed,
}
use std::fmt;

impl fmt::Display for ObjectType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Hash)]
pub struct FilePath {
    parent_id: i32,
    name: String,
    extension: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodexMetadata {
    pub size: u64,
    pub modified: std::time::SystemTime,
    pub created: std::time::SystemTime,
    pub accessed: std::time::SystemTime,
}
#[derive(Debug, Clone, Serialize, Deserialize, Hash, PartialEq)]
pub struct Object {
    pub id: i32,
    pub name: String,
    pub path: FilePath,
    pub object_type: ObjectType,
    pub metadata: CodexMetadata,
    pub indexed: bool,
    pub is_favorite: bool,
    pub thumbnail_path: Option<String>,
}

impl Object {
    pub fn new(
        id: i32,
        name: String,
        extension: String,
        path: String,
        object_type: ObjectType,
        metadata: std::fs::Metadata,
        indexed: bool,
    ) -> Object {
        //handle metadata errors

        Object {
            id,
            name: name.clone(),
            path: FilePath {
                parent_id: id,
                name,
                extension,
                path,
            },
            object_type,
            metadata: CodexMetadata {
                size: metadata.len(),
                modified: metadata.modified().unwrap(),
                created: metadata.created().unwrap(),
                accessed: metadata.accessed().unwrap(),
            },
            indexed,
            is_favorite: false,
            thumbnail_path: None,
        }
    }

    pub fn get_id(&self) -> i32 {
        self.id
    }
    pub fn get_name(&self) -> String {
        self.name.clone()
    }
}
