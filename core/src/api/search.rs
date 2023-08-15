use super::Ctx;
pub use rspc::RouterBuilder;
use rspc::{Error, ErrorCode};
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new().query("search", |t| {
        #[derive(Debug, Clone, Deserialize, Serialize, Type)]
        struct SearchArgs {
            query: String,
        }

        t(|ctx: Ctx, SearchArgs { query }: SearchArgs| async move {
            let response = ctx.manager.search(&query).await.map_err(
                //Match to rspc::error::Error
                |err| Error::new(ErrorCode::NotFound, err.to_string()),
            )?;

            println!("Search response: {:?}", response);
            Ok(response)
        })
    })
}
