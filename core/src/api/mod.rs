use std::sync::Arc;

use crate::{prisma, LibraryManager};
use rspc::Config;
pub use rspc::RouterBuilder;
use std::path::PathBuf;
mod collections;
mod library;
mod locations;
mod notifications;
mod objects;
mod search;
mod tags;
mod tasks;

pub struct Ctx {
    pub client: Arc<prisma::PrismaClient>,
    pub manager: Arc<LibraryManager>,
}

pub type Router = rspc::Router<Ctx>;

pub fn new() -> Arc<Router> {
    Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../web/src/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
        .merge("tasks.", tasks::mount())
        .merge("library.", library::mount())
        .merge("search.", search::mount())
        .merge("notifications.", notifications::mount())
        .merge("tags.", tags::mount())
        .merge("collections.", collections::mount())
        .merge("locations.", locations::mount())
        .merge("objects.", objects::mount())
        .build()
        .arced()
}
