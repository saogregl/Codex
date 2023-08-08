use std::path::Path;
use std::sync::Arc;

use crate::fs_utils::{extension_to_object_type, get_all_files_dir, get_extension, get_metadata};
use crate::library::LocalLibrary;
use crate::search::Searcher;
use codex_prisma::prisma::{library, PrismaClient};
use log::{info, warn, debug, error};
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use uuid::{uuid, Uuid};

pub struct LibraryManager {
    pub db: Arc<PrismaClient>,
    pub libraries: Vec<Arc<LocalLibrary>>,
    handle: Vec<tokio::task::JoinHandle<Result<(), notify::Error>>>,
    searcher: Searcher,
}

impl LibraryManager {
    pub async fn new(db: Arc<PrismaClient>) -> Self {
        let mut libraries = Vec::new();

        //load libraries:
        let loaded_libs = db.library().find_many(vec![]).exec().await.unwrap();

        let _logger = env_logger::builder()
            .target(env_logger::Target::Stdout)
            .init();

        info!("Loaded {} libraries", loaded_libs.len());
        //Log the libraries that were loaded
        info!("Loaded libraries: {:?}", loaded_libs);
        println!("Loaded libraries: {:?}", loaded_libs);

        for library in loaded_libs {
            let uuid_lib = Uuid::parse_str(&library.uuid).unwrap();
            let mut library = LocalLibrary::new(
                uuid_lib,
                library.name.clone().expect("every library has a name"),
                Some(library.name.expect("every library has a name")),
                db.clone(),
            )
            .await;
            libraries.push(library.unwrap());
        }

        info!("The library manager has loaded {:?} libraries", libraries);

        Self {
            db,
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

    pub async fn watch_libraries(&mut self) -> Result<(), notify::Error> {
        for lib in &self.libraries {
            let lib_clone = Arc::clone(lib); // Clone the Arc<Library>

            let locations = lib.get_locations().await.unwrap();

            for location in locations {
                self.handle
                    .push(tokio::task::spawn(Self::watch(location.clone())));
            }
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
