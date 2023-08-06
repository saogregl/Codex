use super::Ctx;
pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;
use std::path::PathBuf;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("get_all_libraries", |t| {
            t(
                |ctx: Ctx, _: ()| async move {
                    ctx.client.user().find_many(vec![]).exec().await.unwrap()
                },
            )
        })
        .mutation("createNewFile", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct createNewFileParam {
                library_id: String,
                name: String,
                kind: Int,
                key_id: Int,
                hidden: Boolean,
                favorite: Boolean,
                important: Boolean,
                note: String,
                date_created: DateTime,
                date_accessed: DateTime,
                path: std::path::PathBuf,
            }

            t(
                |ctx: Ctx,
                 createNewFileParam {
                     library_id,
                     name,
                     kind,
                     key_id,
                     hidden,
                     favorite,
                     important,
                     note,
                     date_created,
                     date_accessed,
                     path,
                 }: createNewFileParam| async move {
                    ctx.client
                        .Object()
                        .create(
                            library_id,
                            name,
                            kind,
                            key_id,
                            hidden,
                            favorite,
                            important,
                            note,
                            date_created,
                            date_accessed,
                            path)
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
}
