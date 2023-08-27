use chrono::{DateTime, FixedOffset, Local, Offset};
use codex_prisma::prisma::{self, notification, PrismaClient};
use log::warn;
use rspc::Type;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub enum NotificationType {
    Info = 1,
    Warning,
    Error,
    FileAdded,
    FileRemoved,
    FileUpdated,
    LibraryAdded,
    LibraryRemoved,
    LibraryUpdated,
    ObjectParsed, 
    ObjectAdded,
    ObjectRemoved,
    ObjectUpdated,
    ThumbnailGenerated,
    IndexingStarted,
    IndexingFinished,
    IndexingFailed,
    SearchStarted,
    SearchFinished,
    SearchFailed,
    ParsingError,
}
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct CodexNotification {
    pub message: String,
    pub notification_type: NotificationType,
}

impl CodexNotification {
    pub fn new(message: String, notification_type: NotificationType) -> Self {
        Self {
            message,
            notification_type,
        }
    }
}

#[derive(Debug)]
pub struct NotificationManager {
    //Do not use notifications directly, use librarie's emit_notification
    pub notifications: broadcast::Sender<CodexNotification>,
    pub db: Arc<PrismaClient>,
}

impl NotificationManager {
    pub fn new(db: Arc<PrismaClient>) -> Self {
        let (tx, _) = broadcast::channel(100);
        // tokio::spawn(async move {
        //     let mut rx = tx.subscribe();
        //     while let Ok(notification) = rx.recv().await {
        //         let _ = db
        //             .notification()
        //             .create(
        //                 notification.notification_type as i32,
        //                 vec![
        //                     notification::message::set(Some(notification.message)),
        //                     notification::expires_at::set(Some(Local::now())),
        //                 ],
        //             )
        //             .exec()
        //             .await
        //             .unwrap();
        //     }
        // });

        Self {
            notifications: tx,
            db,
        }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<CodexNotification> {
        self.notifications.subscribe()
    }

    /// .

    pub fn get_expiration_time(&self) -> DateTime<FixedOffset> {
        let now = Local::now();

        // Create a FixedOffset object with an offset of +1 hour
        let offset = FixedOffset::east_opt(1 * 3600).unwrap(); // +01:00

        // Create a DateTime<FixedOffset> object that represents the current date and time plus one hour
        let one_hour_from_now: DateTime<FixedOffset> =
            now.with_timezone(&offset) + chrono::Duration::hours(1);
        one_hour_from_now
    }

    pub async fn _internal_emit(
        &self,
        notification: CodexNotification,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let expires_at = self.get_expiration_time();

        let _ = self
            .db
            .notification()
            .create(
                notification.notification_type.clone() as i32,
                vec![
                    notification::message::set(Some(notification.message.clone())),
                    notification::expires_at::set(Some(expires_at)),
                ],
            )
            .exec()
            .await
            .unwrap();

        self.notifications.send(notification).ok();
        Ok(())
    }
}
