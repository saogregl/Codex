use anyhow::Error;
use log::{error, warn};
use std::path::Path;
use std::sync::Arc;

use crate::config;
use crate::library::notification::NotificationManager;
use crate::search::Searcher;
use crate::{library::LocalLibrary, search::SearchResult};
use codex_prisma::prisma::PrismaClient;
use log::info;
use notify::{Config, RecommendedWatcher, RecursiveMode, Watcher};
use uuid::Uuid;

use super::notification::{CodexNotification, NotificationType};

pub struct LibraryManager {
    pub db: Arc<PrismaClient>,
    pub libraries: Vec<Arc<LocalLibrary>>,
    handle: Vec<tokio::task::JoinHandle<Result<(), notify::Error>>>,
    pub notification_manager: Arc<NotificationManager>,
    searcher: Searcher,
}

impl LibraryManager {
    pub async fn new(db: Arc<PrismaClient>) -> Result<Self, anyhow::Error> {
        let mut libraries = Vec::new();
        let notification_manager = Arc::new(NotificationManager::new(Arc::clone(&db)));
        let config = config::CodexConfig::new();

        //load libraries:
        let loaded_libs = match db.library().find_many(vec![]).exec().await {
            Ok(libs) => libs,
            Err(e) => {
                error!("Failed to load libraries: {}", e);
                return Ok(LibraryManager {
                    db: db.clone(),
                    libraries,
                    handle: Vec::new(),
                    notification_manager,
                    searcher: Searcher::new(config.index_dir, db.clone())?,
                });
            }
        };

        env_logger::builder()
            .target(env_logger::Target::Stdout)
            .init();

        info!("Loading libraries: {:?}", loaded_libs);

        for library in loaded_libs {
            if let Ok(uuid_lib) = Uuid::parse_str(&library.uuid) {
                let name = match library.name.clone() {
                    Some(name) => name,
                    None => {
                        warn!("Library without name found with UUID: {}", &library.uuid);
                        continue; // skip this iteration of the loop
                    }
                };

                match LocalLibrary::new(
                    uuid_lib,
                    library.id.clone(),
                    name.clone(),
                    Some(name.clone()),
                    Arc::clone(&db),
                    Arc::clone(&notification_manager),
                )
                .await
                {
                    Ok(local_lib) => {
                        if let Err(e) = local_lib.parse_objects().await {
                            error!(
                                "Failed to parse objects for library {}: {}",
                                name.clone(),
                                e
                            );
                        }
                        if let Err(e) = local_lib.generate_thumbnails().await {
                            error!(
                                "Failed to generate thumbnails for library {}: {}",
                                name.clone(),
                                e
                            );
                        }
                        libraries.push(local_lib);
                    }
                    Err(e) => {
                        error!("Failed to create LocalLibrary for {}: {}", name.clone(), e);
                    }
                }
            } else {
                warn!("Invalid UUID found: {}", &library.uuid);
            }
        }

        info!("The library manager has loaded {:?} libraries", libraries);

        let mut searcher = Searcher::new(config.index_dir, Arc::clone(&db))?;
        searcher.index(&mut libraries).await?;

        Ok(Self {
            db,
            libraries,
            handle: Vec::new(),
            notification_manager,
            searcher,
        })
    }

    pub async fn search(&self, query: &str) -> Result<Vec<SearchResult>, anyhow::Error> {
        let search_result: Vec<SearchResult> = self.searcher.search(query).await?;
        self.notification_manager
            ._internal_emit(CodexNotification::new(
                "Search Finished".to_string(),
                NotificationType::SearchFinished,
            ))
            .await?;
        Ok(search_result)
    }

    pub async fn index(&self) -> Result<(), anyhow::Error> {
        info!("Indexing libraries");
        let _ = self.searcher.index(&self.libraries).await?;
        Ok(())
    }

    pub async fn update_library(&self, lib_uuid: String) -> Result<(), anyhow::Error> {
        if let Some(lib) = self
            .libraries
            .iter()
            .find(|lib| lib.id.to_string() == lib_uuid)
        {
            let _ = lib.check_for_changes().await.unwrap();
            let _ = lib.index_objects().await.unwrap();
            let _ = lib.parse_objects().await.unwrap();
            let _ = lib.generate_thumbnails().await.unwrap();
        }
        let _ = &self.index().await.unwrap();
        Ok(())
    }

    pub fn add_library(&mut self, lib: Arc<LocalLibrary>) {
        self.libraries.push(lib);
    }

    pub async fn watch_libraries(&mut self) -> Result<(), notify::Error> {
        for lib in &self.libraries {
            let _lib_clone = Arc::clone(lib); // Clone the Arc<Library>

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
