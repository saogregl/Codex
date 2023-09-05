use super::Ctx;
use chrono::{DateTime, Utc};
use codex_prisma::prisma::{collection, library, object};

pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("get_all_libraries", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.library().find_many(vec![]).exec().await.unwrap()
            })
        })
        .query("get_all_objects", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.object().find_many(vec![]).exec().await.unwrap()
            })
        })
        .query("get_doc_by_id", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetDocById {
                id: i32,
            }

            t(|ctx: Ctx, GetDocById { id }: GetDocById| async move {
                ctx.client
                    .object()
                    .find_first(vec![object::id::equals(id)])
                    .exec()
                    .await
                    .unwrap()
            })
        })
}
