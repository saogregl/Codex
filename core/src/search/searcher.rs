use std::{path::{Path, PathBuf}, sync::Arc};

use tantivy::{
    query::QueryParser,
    schema::{
        Field, IndexRecordOption, Schema, TextFieldIndexing, TextOptions, FAST, INDEXED, STORED,
        TEXT,
    },
    store::{Compressor, ZstdCompressor},
    Document,
    // tokenizer::TextAnalyzer,
    Index,
    TantivyError,
};

use crate::library::{Library, LocalLibrary};

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
    // author: Field,
    // extension: Field,
    // filesize: Field,
    // score_boost: Field,
}

impl Searcher {
    pub fn new(index_dir: impl AsRef<Path>) -> Self {
        let text_indexing = TextFieldIndexing::default()
            .set_tokenizer("default")
            .set_index_option(IndexRecordOption::Basic);

        let text_options = TextOptions::default()
            .set_indexing_options(text_indexing)
            .set_stored();
        

        let mut schema_builder = Schema::builder();
        let title = schema_builder.add_text_field("title", TEXT | STORED);
        let body = schema_builder.add_text_field("body", TEXT);
        // let title = schema_builder.add_text_field("title", text_options.clone());
        // let author = schema_builder.add_text_field("author", text_options.clone());
        // let extension = schema_builder.add_text_field("extension", STORED);
        // let filesize = schema_builder.add_u64_field("filesize", STORED);
        // let score_boost = schema_builder.add_u64_field("score_boost", FAST);
        let schema = schema_builder.build();

        // open or create index
        let index_dir = index_dir.as_ref();
        let mut index = Index::open_in_dir(index_dir).unwrap_or_else(|err| {
            if let TantivyError::OpenDirectoryError(_) | TantivyError::OpenReadError(_) = err {
                std::fs::create_dir_all(index_dir).expect("create index directory");
                Index::create_in_dir(index_dir, schema.clone()).unwrap()
            } else {
                panic!("Error opening index: {err:?}")
            }
        });

        // let tokenizer = get_tokenizer();
        // index
        //     .tokenizers()
        //     .register(META_TOKENIZER, tokenizer.clone());
        // _ = index.set_default_multithread_executor();

        let mut query_parser = QueryParser::for_index(&index, vec![title, body]);
        query_parser.set_conjunction_by_default();

        Self {
            compressor: Compressor::Brotli,

            index,
            schema,
            query_parser,

            title,
            body,
        }
    }

    pub async fn index(
        &mut self,
        libs: &mut Vec<Arc<LocalLibrary>>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        //We need to index all the libraries using the same searcher:

        let mut index_writer = self.index.writer(200_000_000).unwrap();

        for lib in libs {

            let objects = lib.get_objects(lib.id.to_string()).await.unwrap();
            for object in objects {
                let mut doc = Document::default();
    
                // Load text for documents:
                let path = PathBuf::from(object.path.expect("every object has a path"));
                let mut text_path = path.clone();
                text_path.set_extension("txt");
    
                println!("Trying to load text: {:?}", text_path);
    
                if let Ok(text) = std::fs::read_to_string(text_path) {
                    doc.add_text(self.title, &object.obj_name.unwrap());
                    doc.add_text(self.body, &text);
                    index_writer.add_document(doc)?;
                }
            }
        }

        index_writer.commit()?;

        Ok(())
    }

    pub fn search(&self, query: &str) -> Result<(), Box<dyn std::error::Error>> {
        let query = self.query_parser.parse_query(query)?;
        let searcher = self.index.reader()?.searcher();
        let top_docs = searcher.search(&query, &tantivy::collector::TopDocs::with_limit(10))?;

        for (_score, doc_address) in top_docs {
            let retrieved_doc = searcher.doc(doc_address)?;
            let title = retrieved_doc.get_first(self.title).unwrap().as_text().unwrap();
            println!("Title: {}", title);
        }

        Ok(())
    }

    pub fn set_compressor(&mut self, compressor: &str) {
        let compressor = match compressor {
            "none" => Compressor::None,
            "lz4" => Compressor::Lz4,
            "brotli" => Compressor::Brotli,
            "snappy" => Compressor::Snappy,
            _ => {
                if compressor.starts_with("zstd") {
                    Compressor::Zstd(ZstdCompressor::default())
                } else {
                    println!(
                        "compressor not valid: {:#?}",
                        ["none", "lz4", "brotli", "snappy", "zstd",]
                    );
                    std::process::exit(1);
                }
            }
        };

        self.index.settings_mut().docstore_compression = compressor;
    }
}
