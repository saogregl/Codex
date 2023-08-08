use super::Ctx;
use chrono::{DateTime, Utc};
use codex_prisma::prisma::{library, location};
pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;


pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("get_all_libraries", |t| {
            t(
                |ctx: Ctx, _: ()| async move {
                    ctx.client.library().find_many(vec![]).exec().await.unwrap()
                },
            )
        })
        .query("get_all_objects", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.object().find_many(vec![]).exec().await.unwrap()
            })
        })
        .mutation("add_new_location", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddNewLocation {
                library_id: String,
                name: String,
                path: String,
                is_archived: bool,
                hidden: bool,
                date_created: DateTime<Utc>,
            }

            t(
                |ctx: Ctx,
                 AddNewLocation {
                     library_id,
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
                                location::library::connect(library::uuid::equals(library_id)),
                                location::name::set(Some(name)),
                                location::is_archived::set(Some(is_archived)),
                                location::hidden::set(Some(hidden)),
                                location::date_created::set(Some(date_created.into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
}
