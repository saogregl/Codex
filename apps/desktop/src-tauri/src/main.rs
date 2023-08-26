#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use window_shadows::set_shadow;

use codex_core::api;
use codex_prisma::prisma;
use dotenv::dotenv;
use std::sync::Arc;

use tauri::Manager;

#[tauri::command]
fn extend_scope(handle: tauri::AppHandle, path: std::path::PathBuf) {
    let asset_scope = handle.asset_protocol_scope();
    // ideally you don't apply a path sent from the frontend or at least not without some validation
    let _ = asset_scope.allow_file(&path);
}

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    #[cfg(any(windows, target_os = "macos"))]
    let client = Arc::new(prisma::new_client().await?);  // Propagate error using `?`

    let router = api::new();
    let manager = Arc::new(codex_core::LibraryManager::new(Arc::clone(&client)).await?);  // Propagate error using `?`

    let mut _app = tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router, move || {
            api::Ctx {
                client: Arc::clone(&client),
                manager: Arc::clone(&manager),
            }
        }))
        .invoke_handler(tauri::generate_handler![extend_scope])
        .setup(move |app| {
            if cfg!(target_os = "windows") || cfg!(target_os = "linux") {
                let window = app.get_window("main").unwrap();
                window.set_decorations(false)?;
                // Try set shadow and ignore errors if it failed.
                set_shadow(&window, true).unwrap_or_default();
            }
            Ok(())
        })
        .run(tauri::generate_context!())?;

    Ok(())
}
