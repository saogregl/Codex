use notify::{Config, Error, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use std::{path::Path, sync::mpsc::Receiver, time::Duration};

use crate::library::{Library, LocalLibrary};

#[derive(Debug)]
pub struct LibraryWatcher {
    pub library: LocalLibrary,
    pub watcher: RecommendedWatcher,
    path: String,
    pub rx: Receiver<Result<Event, Error>>,
}

impl LibraryWatcher {
    pub fn new(lib: &LocalLibrary, path: String) -> Result<Self, notify::Error> {
        let (tx, rx) = std::sync::mpsc::channel();
        const POLLING_TIMEOUT: Duration = Duration::from_secs(1);

        let mut watcher =
            RecommendedWatcher::new(tx, Config::default().with_poll_interval(POLLING_TIMEOUT))?;

        Ok(Self {
            library: lib.clone(),
            watcher,
            path,
            rx,
        })
    }

    pub async fn watch(&mut self) -> notify::Result<()> {
        let path: &Path = Path::new(&self.path);

        Ok(())
    }
}
