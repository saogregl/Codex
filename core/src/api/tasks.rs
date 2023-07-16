use super::Ctx;
pub use rspc::RouterBuilder;
use specta::Type;
use serde::{Deserialize, Serialize};

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("getAllProjectActivities", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client
                    .project_activities()
                    .find_many(vec![])
                    .exec()
                    .await
                    .unwrap()
            })
        })
}
