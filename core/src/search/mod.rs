use codex_prisma::prisma::object::Data;
use serde::{Deserialize, Serialize};

// Re-export SearchEngine from its file
pub use self::searcher::Searcher;
// Include sub-module
mod searcher;

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
pub struct SearchResult {
    pub title: String,
    pub snippet: String,
    pub score: f32,
    pub object: Data,
}
impl SearchResult {
    pub fn new(title: String, snippet: String, score: f32, object: Data) -> Self {
        Self {
            title,
            snippet,
            score,
            object,
        }
    }
}
