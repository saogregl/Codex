use std::path::Path;
use std::sync::Arc;

use crate::fs_utils::{extension_to_object_type, get_all_files_dir, get_extension, get_metadata};
use crate::library::LocalLibrary;
use crate::object::{Object, ObjectType};
use crate::search::Searcher;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};

pub struct LibraryManager {
    pub libraries: Vec<Arc<LocalLibrary>>,
    handle: Vec<tokio::task::JoinHandle<Result<(), notify::Error>>>,
    searcher: Searcher,
}

impl LibraryManager {
    pub fn new() -> Self {
        let libraries = Vec::new();
        Self {
            libraries,
            handle: Vec::new(),
            searcher: Searcher::new("./index"),
        }
    }

    pub fn search(&self, query: &str) -> Result<(), Box<dyn std::error::Error>> {
        let _ = self.searcher.search(query);
        Ok(())
    }

    pub fn index(&mut self) -> Result<(), Box<dyn std::error::Error>> { 
        let _ = self.searcher.index(&mut self.libraries);
        Ok(())
    }

    pub fn add_library(&mut self, lib: Arc<LocalLibrary>) {
        self.libraries.push(lib);
        
    }

    pub fn watch_libraries(&mut self) -> Result<(), notify::Error> {
        for lib in &self.libraries {
            let lib_clone = Arc::clone(lib); // Clone the Arc<Library>
            self.handle
                .push(tokio::task::spawn(Self::watch(lib_clone.path.clone())));
        }
        Ok(())
    }

    async fn watch<P: AsRef<Path>>(path: P) -> notify::Result<()> {
        let (tx, rx) = std::sync::mpsc::channel();

        // Automatically select the best implementation for your platform.
        // You can also access each implementation directly e.g. INotifyWatcher.
        let mut watcher = RecommendedWatcher::new(tx, Config::default())?;

        // Add a path to be watched. All files and directories at that path and
        // below will be monitored for changes.
        watcher.watch(path.as_ref(), RecursiveMode::Recursive)?;

        for res in &rx {
            match res {
                Ok(event) => println!("Change: {event:?}"),
                Err(error) => println!("Error: {error:?}"),
            }
        }
        Ok(())
    }
}
