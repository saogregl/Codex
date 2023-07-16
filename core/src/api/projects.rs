use super::Ctx;
use crate::prisma;
pub use rspc::RouterBuilder;
use specta::Type;
use serde::{Deserialize, Serialize};

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("getProjects", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.project().find_many(vec![]).exec().await.unwrap()
            })
        })
        .query("getProjectsFromWorkspace", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetArgs {
                workspace_id: String,
            }

            t(|ctx: Ctx, GetArgs { workspace_id }: GetArgs| async move {
                ctx.client
                    .project()
                    .find_many(vec![prisma::project::workspace_id::equals(Some(
                        workspace_id.into(),
                    ))])
                    .exec()
                    .await
                    .unwrap()
            })
        })
}
