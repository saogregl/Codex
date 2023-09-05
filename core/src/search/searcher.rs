use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

use codex_prisma::prisma::{
    location::{self, Data as locationData},
    object::{self, Data as objectData},
    PrismaClient,
};
use log::info;

use tantivy::{
    query::QueryParser,
    schema::{
        Field, IndexRecordOption, Schema, TextFieldIndexing, TextOptions, FAST, STORED, TEXT,
    },
    store::{Compressor, ZstdCompressor},
    DocAddress, Document, Index, SnippetGenerator, TantivyError,
};

use crate::library::{Library, LocalLibrary};

use super::SearchResult;

#[derive(Clone)]

pub struct Searcher {
    pub compressor: Compressor,

    index: Index,
    schema: Schema,
    query_parser: QueryParser,

    // fields
    // id: Field,
    title: Field,
    body: Field,

    db: Arc<PrismaClient>,
    // author: Field,
    // extension: Field,
    // filesize: Field,
    // score_boost: Field,
}

impl Searcher {
    pub fn new(index_dir: impl AsRef<Path>, db: Arc<PrismaClient>) -> Result<Self, anyhow::Error> {
        let text_indexing = TextFieldIndexing::default()
            .set_tokenizer("default")
            .set_index_option(IndexRecordOption::Basic);

        let _text_options = TextOptions::default()
            .set_indexing_options(text_indexing)
            .set_stored();

        let mut schema_builder = Schema::builder();
        let title = schema_builder.add_text_field("title", TEXT | STORED);
        let body = schema_builder.add_text_field("body", TEXT | STORED | FAST);

        let schema = schema_builder.build();

        // open or create index
        let index_dir = index_dir.as_ref();
        let index = Self::setup_index(&index_dir, &schema)?;

        let mut query_parser = QueryParser::for_index(&index, vec![title, body]);
        query_parser.set_conjunction_by_default();

        Ok(Self {
            compressor: Compressor::Lz4,

            index,
            schema,
            query_parser,
            db,

            title,
            body,
        })
    }

    pub async fn index(&self, libs: &Vec<Arc<LocalLibrary>>) -> Result<(), anyhow::Error> {
        let mut index_writer = self.index.writer(200_000_000)?;

        //If env variable REBUILD_INDEX is set to true, delete the index and rebuild it
        if std::env::var("REBUILD_INDEX").unwrap_or("FALSE".to_string()) == "TRUE" {
            info!("Rebuilding index");
            let clear_res = index_writer.delete_all_documents().unwrap();
            // have to commit, otherwise deleted terms remain available
            index_writer.commit()?;
        }

        for lib in libs {
            let locations = lib.db.location().find_many(vec![]).exec().await?;

            for location in locations {
                let objects = lib
                    .db
                    .object()
                    .find_many(vec![object::locations::is(vec![location::uuid::equals(
                        location.uuid.clone(),
                    )])])
                    .exec()
                    .await?;

                for object in objects {
                    if object.indexed.unwrap_or(false) {
                        info!(
                            "Object already indexed: {:?}",
                            object.obj_name.as_ref().unwrap_or(&"Unnamed".to_string())
                        );
                        continue;
                    }

                    let text_path = object.parsed_path.clone();

                    match text_path {
                        Some(text_path) => {
                            info!("Indexing object: {:?}", text_path);
                            if let Ok(text) = std::fs::read_to_string(&text_path) {
                                info!("Text file found for object: {:?}", text_path);
                                let mut doc = Document::default();
                                doc.add_text(
                                    self.title,
                                    &object.obj_name.as_ref().unwrap_or(&"Unnamed".to_string()),
                                );
                                doc.add_text(self.body, &text);

                                if let Ok(doc) = index_writer.add_document(doc) {
                                    info!("Document added to index: {:?}", doc);
                                } else {
                                    info!("Document not added to index");
                                };

                                lib.db
                                    .object()
                                    .update(
                                        object::uuid::equals(object.uuid),
                                        vec![object::indexed::set(Some(true))],
                                    )
                                    .exec()
                                    .await?;

                                info!(
                                    "Indexed object: {:?}",
                                    object.obj_name.as_ref().unwrap_or(&"Unnamed".to_string())
                                );
                            }
                        }
                        None => {
                            info!(
                                "Text file not found for object: {:?}",
                                object.obj_name.as_ref().unwrap_or(&"Unnamed".to_string())
                            );
                            continue;
                        }
                    }
                }
            }
        }

        index_writer.commit()?;

        Ok(())
    }

    fn construct_text_path(
        location: &locationData,
        object: &objectData,
    ) -> Result<PathBuf, anyhow::Error> {
        let mut text_path = PathBuf::from(&location.path);
        text_path.push("parsed");
        text_path.push(
            object
                .obj_name
                .as_ref()
                .ok_or("every object needs a name")
                .unwrap(),
        );
        text_path.set_extension("txt");
        Ok(text_path)
    }

    fn setup_index(index_dir: &Path, schema: &Schema) -> Result<Index, anyhow::Error> {
        match Index::open_in_dir(index_dir) {
            Ok(index) => Ok(index),
            Err(err) => match err {
                TantivyError::OpenDirectoryError(_) | TantivyError::OpenReadError(_) => {
                    std::fs::create_dir_all(index_dir)?;
                    Index::create_in_dir(index_dir, schema.clone()).map_err(From::from)
                }
                _ => Err(anyhow::anyhow!(err)),
            },
        }
    }

    pub async fn search(&self, query_input: &str) -> Result<Vec<SearchResult>, anyhow::Error> {
        // Parse the query
        let query = self.query_parser.parse_query(query_input)?;

        // Create a searcher and execute the search
        let searcher = self.index.reader()?.searcher();
        let top_docs = searcher.search(&query, &tantivy::collector::TopDocs::with_limit(30))?;

        // Set up snippet generator
        let mut snippet_generator = SnippetGenerator::create(&searcher, &*query, self.body)?;
        snippet_generator.set_max_num_chars(300);

        // Retrieve documents from the searcher
        let mut query_result: Vec<SearchResult> = Vec::new();

        for (score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)?;

            let title = retrieved_doc
                .get_first(self.title)
                .ok_or("Title field not found in document")
                .unwrap()
                .as_text()
                .ok_or("Title field is not a text field")
                .unwrap();

            // Fetch object by its name
            let obj = self
                .db
                .object()
                .find_first(vec![object::obj_name::equals(Some(title.to_string()))])
                .exec()
                .await?;

            if obj.is_none() {
                return Err(anyhow::anyhow!(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "object not found in the database",
                )));
            }

            // Generate a snippet from the document
            let snippet = snippet_generator.snippet_from_doc(&retrieved_doc);
            let snippet_html: String = snippet.to_html();

            query_result.push(SearchResult::new(
                title.to_owned(),
                snippet_html,
                score,
                obj.unwrap(),
            ));
        }

        Ok(query_result)
    }

    pub async fn generate_snippet(
        &self,
        query_input: &str,
        doc_address: DocAddress,
    ) -> Result<String, anyhow::Error> {
        let searcher = self.index.reader()?.searcher();
        let query = self.query_parser.parse_query(query_input)?;

        let mut snippet_generator = SnippetGenerator::create(&searcher, &*query, self.body)?;
        snippet_generator.set_max_num_chars(300);
        let retrieved_doc = searcher.doc(doc_address)?;

        let snippet = snippet_generator.snippet_from_doc(&retrieved_doc);
        let snippet_html: String = snippet.to_html();

        Ok(snippet_html)
    }
}
