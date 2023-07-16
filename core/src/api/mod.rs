use std::sync::Arc;

use crate::prisma;
use rspc::Config;
pub use rspc::RouterBuilder;
use std::path::PathBuf;

mod tasks;
pub struct Ctx {
    pub client: Arc<prisma::PrismaClient>,
}

pub type Router = rspc::Router<Ctx>;

pub(crate) fn new() -> Arc<Router> {
    let r = Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../web/src/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
        .merge("tasks.", tasks::mount())
        .build()
        .arced();
    r
}
