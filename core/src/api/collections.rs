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
        .query("get_all_collections", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.collection().find_many(vec![]).exec().await.unwrap()
            })
        })
        .query("get_all_objects", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.object().find_many(vec![]).exec().await.unwrap()
            })
        })
        .mutation("add_new_location", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddNewLocation {
                collection_id: String,
                name: String,
                path: String,
                is_archived: bool,
                hidden: bool,
                date_created: DateTime<Utc>,
            }
            t(
                |ctx: Ctx,
                 AddNewLocation {
                     collection_id,
                     name,
                     path,
                     is_archived,
                     hidden,
                     date_created,
                 }: AddNewLocation| async move {
                    ctx.client
                        .location()
                        .create(
                            path,
                            vec![
                                location::collection::connect(collection::uuid::equals(
                                    collection_id.clone(),
                                )),
                                location::name::set(Some(name)),
                                location::is_archived::set(Some(is_archived)),
                                location::hidden::set(Some(hidden)),
                                location::date_created::set(Some(date_created.into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();

                    let res = tokio::spawn(async move {
                        let _ = ctx.manager.update_library(collection_id.clone()).await;
                    });
                    res.await.unwrap();
                },
            )
        })
        .query("get_collections_for_library", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetCollectionsForLibrary {
                library_id: String,
            }
            t(
                |ctx: Ctx,
                 GetCollectionsForLibrary { library_id }: GetCollectionsForLibrary| async move {
                    ctx.client
                        .collection()
                        .find_many(vec![collection::library_id::equals(library_id)])
                        .exec()
                        .await
                        .unwrap()
                },
            )
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
