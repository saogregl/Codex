use directories::ProjectDirs;

pub struct CodexConfig {
    pub cache_dir: std::path::PathBuf,
    pub config_dir: std::path::PathBuf,
    pub data_dir: std::path::PathBuf,
}

impl CodexConfig {
    pub fn new() -> Self {
        let project_dir = ProjectDirs::from("com", "jacto", "codex")
            .expect("Unable to determine project directories");
        //Fix this later, we should have some hardcoded defaults just in case. (You never know)
        let cache_dir = project_dir.cache_dir();
        let config_dir = project_dir.config_dir();
        let data_dir = project_dir.data_dir();
        CodexConfig {
            cache_dir: cache_dir.to_path_buf(),
            config_dir: config_dir.to_path_buf(),
            data_dir: data_dir.to_path_buf(),
        }
    }
}
