use super::Ctx;
pub use rspc::RouterBuilder;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new().query("getWorkspaces", |t| {
        t(|ctx: Ctx, _: ()| async move {
            ctx.client
                .workspace()
                .find_many(vec![])
                .exec()
                .await
                .unwrap()
        })
    })
}
