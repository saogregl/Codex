use super::Ctx;
use chrono::{DateTime, Utc};
use codex_prisma::prisma;
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
                library_id: i32,
                name: String, 
                kind: i32,
                key_id: i32,
                hidden: bool,
                favorite: bool,
                important: bool,
                note: String,
                date_created: DateTime<Utc>,
                date_accessed: DateTime<Utc>,
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

                    let file_path = ctx.client
                        .file_path()
                        .create(
                            vec![
                                prisma::file_path::name::set(Some(path.to_str().unwrap().to_string())),
                                prisma::file_path::extension::set(Some(path.extension().unwrap().to_str().unwrap().to_string())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();


                    ctx.client
                        .object()
                        .create(
                            vec![
                                prisma::object::library_id::set(Some(library_id)),
                                prisma::object::obj_name::set(Some(name)),
                                prisma::object::kind::set(Some(kind)),
                                prisma::object::hidden::set(Some(hidden)),
                                prisma::object::favorite::set(Some(favorite)),
                                prisma::object::important::set(Some(important)),
                                prisma::object::note::set(Some(note)),
                                prisma::object::date_created::set(Some(date_created.into())),
                                prisma::object::date_accessed::set(Some(date_accessed.into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
}
