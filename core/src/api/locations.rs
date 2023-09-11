use super::Ctx;
use chrono::{DateTime, Utc};
use codex_prisma::prisma::{collection, library, location, object};
use log::{error, info};
use rspc::{Error, ErrorCode};

pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
    .query("get_all_locations_for_collection", |t| { 
        #[derive(Debug, Clone, Deserialize, Serialize, Type)]
        struct GetLocationsForCollection {
            collection_id: i32,
        }
        t(|ctx: Ctx, GetLocationsForCollection { collection_id }: GetLocationsForCollection| async move {
            ctx.client.location().find_many(vec![
                location::collection_id::equals(Some(collection_id.clone())),
            ]).exec().await.unwrap()
        })
    })
}
