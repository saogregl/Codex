use super::Ctx;
use chrono::{DateTime, Utc};
use codex_prisma::prisma::{collection, library, location, object};
use log::{error, info};
use rspc::{Error, ErrorCode};

pub use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};
use specta::Type;

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("get_all_collections", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client.collection().find_many(vec![]).exec().await.unwrap()
            })
        })
        .query("get_all_objects_in_collection", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetObjectsInCollection {
                collection_id: i32,
            }
            t(|ctx: Ctx, GetObjectsInCollection { collection_id }: GetObjectsInCollection| async move {
                ctx.client.object().find_many(vec![
                    object::collection_id::equals(collection_id.clone()),
                ]).exec().await.unwrap()
            })
        })
        .mutation("edit_collection_by_id", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct EditCollectionByID {
                id: i32,
                name: String,
                description: String,
            }
            t(
                |ctx: Ctx,
                 EditCollectionByID {
                     id,
                     name,
                     description,
                 }: EditCollectionByID| async move {
                    ctx.client
                        .collection()
                        .update(
                            collection::id::equals(id.clone()),
                            vec![
                                collection::name::set(Some(name)),
                                collection::description::set(Some(description)),
                                collection::date_modified::set(Some(Utc::now().into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();
                },
            )

        })
        .mutation("add_new_location", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddNewLocation {
                collection_id: i32,
                name: String,
                path: String,
                is_archived: bool,
                hidden: bool,
                date_created: DateTime<Utc>,
            }
            t(
                |ctx: Ctx,
                 AddNewLocation {
                     collection_id,
                     name,
                     path,
                     is_archived,
                     hidden,
                     date_created,
                 }: AddNewLocation| async move {
                    ctx.client
                        .location()
                        .create(
                            path,
                            vec![
                                location::collection::connect(collection::id::equals(
                                    collection_id.clone(),
                                )),
                                location::name::set(Some(name)),
                                location::is_archived::set(Some(is_archived)),
                                location::hidden::set(Some(hidden)),
                                location::date_created::set(Some(date_created.into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();

                    //get the library id from the collection id
                    let collection = ctx.client.collection().find_first(vec![collection::id::equals(collection_id.clone())]).exec().await.unwrap();
                    let library_id = collection.unwrap().library_id;
                    let _ = ctx.manager.update_library(library_id.clone()).await;
                },
            )
        })
        .mutation("add_new_collection", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddNewCollection {
                library_id: i32,
                name: String,
                date_created: DateTime<Utc>,
            }
            t(
                |ctx: Ctx,
                 AddNewCollection {
                     library_id,
                     name,
                     date_created,
                 }: AddNewCollection| async move {
                    ctx.client
                        .collection()
                        .create(
                            library::id::equals(library_id.clone()),
                                vec![
                                    collection::name::set(Some(name)),
                                    collection::date_created::set(Some(date_created.into())),
                                    collection::date_modified::set(Some(date_created.into())),
                                    ]
                        )
                        .exec()
                        .await
                        .unwrap();
                },
            )
        })
        .mutation("create_collection_with_location", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct CreateCollectionWithLocation {
                library_id: i32,
                name: String,
                path: String,
                is_archived: bool,
                hidden: bool,
            }
            t(
                |ctx: Ctx,
                 CreateCollectionWithLocation {
                     library_id,
                     name,
                     path,
                     is_archived,
                     hidden,
                 }: CreateCollectionWithLocation| async move {
                    let date_created = Utc::now();
                    let collection = ctx.client
                        .collection()
                        .create(
                            library::id::equals(library_id.clone()),
                                vec![
                                    collection::name::set(Some(name.clone())),
                                    collection::date_created::set(Some(date_created.into())),
                                    collection::date_modified::set(Some(date_created.into())),
                                    ]
                        )
                        .exec()
                        .await
                        .unwrap();

                    let collection_id = collection.id;

                    ctx.client
                        .location()
                        .create(
                            path,
                            vec![
                                location::collection::connect(collection::id::equals(
                                    collection_id.clone(),
                                )),
                                location::name::set(Some(name)),
                                location::is_archived::set(Some(is_archived)),
                                location::hidden::set(Some(hidden)),
                                location::date_created::set(Some(date_created.into())),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();

                    //get the library id from the collection id
                    let _ = ctx.manager.update_library(library_id.clone()).await;
                },
            )
        })
        .query("get_collections_on_library", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetCollectionsOnLibrary {
                library_id: i32,
            }
            t(
                |ctx: Ctx,
                 GetCollectionsOnLibrary { library_id }: GetCollectionsOnLibrary| async move {
                    ctx.client
                        .collection()
                        .find_many(vec![collection::library_id::equals(library_id)])
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
}
