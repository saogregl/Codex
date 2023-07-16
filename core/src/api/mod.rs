use std::sync::Arc;


use rspc::Config;
pub use rspc::RouterBuilder;
use std::path::PathBuf;
mod projects;
mod workspaces;
mod tasks;

pub struct Ctx {
    pub client: Arc<codex_prisma::prisma::PrismaClient>,
}

pub type Router = rspc::Router<Ctx>;

pub fn new() -> Arc<Router> {
    let r = Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../web/src/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
        .merge("tasks.", tasks::mount())
        .merge("projects.", projects::mount())
        .merge("workspaces.", workspaces::mount())
        .build()
        .arced();
    r
}
