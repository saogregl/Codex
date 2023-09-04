use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    sync::Arc,
    time::SystemTime,
};

use crate::{
    fs_utils::extract_location_path, library::notification::NotificationType, parsing, thumbnail,
};

use anyhow::anyhow;
use chrono::{TimeZone, Utc};
use codex_prisma::prisma::{self, collection, library, location, object::extension, PrismaClient};
use futures::future::try_join_all;
use log::{error, info};
use std::collections::HashSet;
use tokio::task;
use uuid::Uuid;

use codex_prisma::prisma::object;

use super::notification::{CodexNotification, NotificationManager};

#[derive(Debug, Clone)]
pub struct LocalCollection {
    pub uuid: Uuid,
    pub id: i32,
    pub name: String,
    pub description: Option<String>,
    pub db: Arc<PrismaClient>,
    pub notification_manager: Arc<NotificationManager>,
}

impl LocalCollection {
    pub async fn new(
        uuid: Uuid,
        id: i32,
        name: String,
        description: Option<String>,
        db: Arc<PrismaClient>,
        notification_manager: Arc<NotificationManager>,
    ) -> anyhow::Result<Self> {

        Ok(Self {
            uuid,
            id,
            name,
            description,
            db,
            notification_manager,
        })
    }

}
