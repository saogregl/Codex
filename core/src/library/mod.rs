// Re-export LocalLibrary and CloudLibrary from their respective files
pub use self::library::LocalLibrary;
pub use self::manager::LibraryManager;
// Include sub-modules
mod collection;
mod library;
mod manager;
mod notification;

pub trait Library {
    fn new(id: i32, name: String, path: String) -> Result<Self, Box<dyn std::error::Error>>
    where
        Self: Sized;
    fn index_objects(&mut self);
    fn generate_thumbnails(&mut self);
    fn parse_objects(&mut self);
    fn update_library(&mut self);
}
