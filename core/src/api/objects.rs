use super::Ctx;
use chrono::Utc;
use codex_prisma::prisma::{object, tag, tag_on_object};
pub use rspc::RouterBuilder;
use rspc::{Error, ErrorCode};
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new().mutation("edit_object", |t| {
        #[derive(Debug, Clone, Deserialize, Serialize, Type)]
        struct EditObject {
            object_id: i32,
            name: String,
            description: String,
            favorite: bool,
        }

        t(
            |ctx: Ctx,
             EditObject {
                 object_id,
                 name,
                 description,
                 favorite,
             }: EditObject| async move {

                ctx.client
                    .object()
                    .update(
                        object::id::equals(object_id),
                        vec![
                            object::pub_name::set(Some(name)),
                            object::description::set(Some(description)),
                            object::favorite::set(Some(favorite)),
                        ],
                    )
                    .exec()
                    .await
                    .unwrap();
            },
        )
    })
}
