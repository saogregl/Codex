use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub enum ObjectType {
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

impl Default for ObjectType {
    fn default() -> Self {
        ObjectType::Unknown
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, Hash)]
pub struct FilePath {
    parent_id: i32,
    name: String,
    extension: String,
    pub path: String,
}

impl PartialEq for FilePath {
    fn eq(&self, other: &Self) -> bool {
        self.path == other.path
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
pub struct CodexMetadata {
    pub size: u64,
    pub modified: std::time::SystemTime,
    pub created: std::time::SystemTime,
    pub accessed: std::time::SystemTime,
}
#[derive(Debug, Clone, Serialize, Deserialize, Eq, Hash, PartialEq)]
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
