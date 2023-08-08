use super::Ctx;
pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("getAllUsers", |t| {
            t(
                |ctx: Ctx, _: ()| async move {
                    ctx.client.user().find_many(vec![]).exec().await.unwrap()
                },
            )
        })
        .mutation("createNewUser", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct CreateNewUserParam {
                id: String,
                name: String,
            }

            t(
                |ctx: Ctx, CreateNewUserParam { id, name }: CreateNewUserParam| async move {
                    ctx.client
                        .user()
                        .create(id, name, vec![])
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
}
