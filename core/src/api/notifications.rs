use super::Ctx;

use async_stream::stream;
use chrono::{DateTime, Utc};
pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("get_notifications", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client
                    .notification()
                    .find_many(vec![])
                    .exec()
                    .await
                    .unwrap()
            })
        })
        .subscription("listen", |t| {
            t(|ctx: Ctx, _: ()| {
                stream! {
                    let mut rx = ctx.manager.notification_manager.subscribe();
                    while let Ok(notification) = rx.recv().await {
                            yield notification;
                    }
                }
            })
        })
}
