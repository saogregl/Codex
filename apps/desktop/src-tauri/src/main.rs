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

    //get parent directory of the path
    let parent = path.parent().unwrap();
    //Allow directory
    let _ = asset_scope.allow_directory(&parent, false);
    let _ = asset_scope.allow_file(&path);

    println!(
        "is allowed {:?}, for path: {:?}",
        asset_scope.is_allowed(&path),
        path
    );
}

#[tokio::main]
pub async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    //we expect a dev.db file to exist in the root of the project
    //this is a sqlite database that is used to store the library
    //Check if it exists and, if not, create it: 
    let db_path = std::path::Path::new("dev.db");
    if !db_path.exists() {
        let _ = std::fs::File::create(db_path);
    }


    #[cfg(any(windows, target_os = "macos"))]
    let client = Arc::new(prisma::new_client().await?); // Propagate error using `?`

    let router = api::new();
    let client_clone = Arc::clone(&client);
    let manager_handle = tokio::task::spawn_blocking(move || {
        // This closure runs in a dedicated thread where blocking is acceptable.
        codex_core::LibraryManager::new(client_clone)
    });
    let manager_result = Arc::new(manager_handle.await?.await?);

    let mut _app = tauri::Builder::default()
        .plugin(rspc::integrations::tauri::plugin(router, move || {
            api::Ctx {
                client: Arc::clone(&client),
                manager: Arc::clone(&manager_result),
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
