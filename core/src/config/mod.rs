use directories::ProjectDirs;
use whoami;

pub struct User {
    pub name: String,
    pub user_name: String,
}

pub struct CodexConfig {
    pub cache_dir: std::path::PathBuf,
    pub config_dir: std::path::PathBuf,
    pub data_dir: std::path::PathBuf,
    pub index_dir: std::path::PathBuf,
    pub user: User,
}

impl CodexConfig {
    pub fn new() -> Self {
        let project_dir = ProjectDirs::from("com", "jacto", "codex")
            .expect("Unable to determine project directories");
        //Fix this later, we should have some hardcoded defaults just in case. (You never know)
        let cache_dir = project_dir.cache_dir();
        let config_dir = project_dir.config_dir();
        let data_dir = project_dir.data_dir();
        let index_dir = data_dir.join("index");

        // Check if the directories exist
        if !cache_dir.exists() {
            std::fs::create_dir_all(&cache_dir).expect("Unable to create cache directory");
        }
        if !config_dir.exists() {
            std::fs::create_dir_all(&config_dir).expect("Unable to create config directory");
        }
        if !data_dir.exists() {
            std::fs::create_dir_all(&data_dir).expect("Unable to create data directory");
        }
        if !index_dir.exists() {
            std::fs::create_dir_all(&index_dir).expect("Unable to create index directory");
        }

        let user = User {
            name: whoami::realname(),
            user_name: whoami::username(),
        };

        CodexConfig {
            cache_dir: cache_dir.to_path_buf(),
            config_dir: config_dir.to_path_buf(),
            data_dir: data_dir.to_path_buf(),
            index_dir: index_dir.to_path_buf(),
            user,
        }
    }
}
