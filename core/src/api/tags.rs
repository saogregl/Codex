use super::Ctx;
use chrono::Utc;
use codex_prisma::prisma::{object, tag, tag_on_object};
pub use rspc::RouterBuilder;
use rspc::{Error, ErrorCode};
use serde::{Deserialize, Serialize};
use specta::Type;

// //Note that our tag schema looks like:
// model Tag {
//     id              Int           @id @default(autoincrement())
//     uuid            String        @unique @default(uuid())
//     name            String?
//     color           String?
//     // Enum: ??
//     redundancy_goal Int?
//     date_created    DateTime?
//     date_modified   DateTime?
//     tag_Objects     TagOnObject[]

//     @@map("tag")
//   }

//   /// @relation(item: tag, group: Object)
//   model TagOnObject {
//     tag_id    Int
//     tag       Tag    @relation(fields: [tag_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
//     Object_id Int
//     Object    Object @relation(fields: [Object_id], references: [id], onDelete: NoAction, onUpdate: NoAction)

//     @@id([tag_id, Object_id])
//     @@map("tag_on_Object")
//   }

// We can see that we have a many-to-many relationship between tags and objects.

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .mutation("add_new_tag", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct CreateNewTagArgs {
                name: String,
                color: String,
            }

            t(
                |ctx: Ctx, CreateNewTagArgs { name, color }: CreateNewTagArgs| async move {

                    let tag = ctx
                        .client
                        .tag()
                        .find_many(vec![tag::name::equals(Some(name.clone())), tag::color::equals(Some(color.clone()))])
                        .exec()
                        .await?;


                    if tag.len() > 0 {
                        return Err(rspc::Error::new(
                            ErrorCode::NotFound,
                            "Tag already exists".to_string(),
                        ));
                    } else {
                        let tag = ctx
                            .client
                            .tag()
                            .create(vec![
                                tag::name::set(Some(name.clone())),
                                tag::color::set(Some(color.clone())),
                                tag::date_created::set(Some(Utc::now().into())),
                                tag::date_modified::set(Some(Utc::now().into())),
                            ])
                            .exec()
                            .await?;

                        Ok(tag)
                    }


                    },
            )


        })
        .mutation("add_tag_unchecked" , |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct CreateNewTagUncheckdArgs {
                name: String,
                color: String,
            }
            t(
                |ctx: Ctx, CreateNewTagUncheckdArgs { name, color }: CreateNewTagUncheckdArgs| async move {

                        let tag = ctx
                            .client
                            .tag()
                            .create(vec![
                                tag::name::set(Some(name.clone())),
                                tag::color::set(Some(color.clone())),
                                tag::date_created::set(Some(Utc::now().into())),
                                tag::date_modified::set(Some(Utc::now().into())),
                            ])
                            .exec()
                            .await?;

                        Ok(tag)


                    },
            )

        })
        .mutation("add_tag_to_object", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddTagToObjectArgs {
                tag_id: i32,
                object_id: i32,
                remove_tag: bool,
            }
            t(
                |ctx: Ctx,
                 AddTagToObjectArgs {
                    remove_tag,
                    tag_id,
                    object_id,
                 }: AddTagToObjectArgs| async move {
                    //First we'll check if the tag exists
                    let (tag, objects) = ctx
                    .client
                    ._batch((
                        ctx.client
                            .tag()
                            .find_many(vec![tag::id::equals(tag_id)]),
                        ctx.client
                            .object()
                            .find_unique(object::id::equals(object_id)),
                    ))
                    .await?;

                    if tag.len() > 0 {
                        if let Some(_) = objects {
                            if remove_tag { 
                                ctx.client
                                .tag_on_object()
                                .delete_many(vec![
                                    tag_on_object::tag_id::equals(tag_id.clone()),
                                    tag_on_object::object_id::equals(object_id.clone()),
                                ])
                                .exec()
                                .await
                                .unwrap();
                            } else { 
                                ctx.client
                                .tag_on_object()
                                .create_unchecked(
                                    tag_id.clone(), 
                                    object_id.clone(),
                                    vec![
                                    ],
                                )
                                .exec()
                                .await
                                .unwrap();
                            }
        
                            return Ok(());
                        } else {
                            return Err(rspc::Error::new(
                                ErrorCode::NotFound,
                                "Object not found".to_string(),
                            ));
                        }
                    } else {
                        Err(rspc::Error::new(
                            ErrorCode::NotFound,
                            "Tag not found".to_string(),
                        ))
                    }




                },
            )
        })
        .query("get_object_with_tags", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetObjectWithTags {
                tag_uuids: Vec<String>,
                object_uuid: String,
            }
            t(
                |ctx: Ctx,
                 GetObjectWithTags {
                     tag_uuids,
                     object_uuid,
                 }: GetObjectWithTags| async move {
                    let (tag, objects) = ctx
                        .client
                        ._batch((
                            ctx.client
                                .tag()
                                .find_many(vec![tag::uuid::in_vec(tag_uuids)]),
                            ctx.client
                                .object()
                                .find_unique(object::uuid::equals(object_uuid)),
                        ))
                        .await?;

                    if tag.len() > 0 {
                        if let Some(objects) = objects {
                            return Ok((tag, objects));
                        } else {
                            return Err(rspc::Error::new(
                                ErrorCode::NotFound,
                                "Object not found".to_string(),
                            ));
                        }
                    } else {
                        Err(rspc::Error::new(
                            ErrorCode::NotFound,
                            "Tag not found".to_string(),
                        ))
                    }
                },
            )
        })
        .query("get_tag", |t| { 
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetTag {
                tag_id: i32,
            }
            t(
                |ctx: Ctx,
                 GetTag {
                     tag_id,
                 }: GetTag| async move {
                    let tag = ctx
                        .client
                        .tag()
                        .find_unique(tag::id::equals(tag_id.clone()))
                        .exec()
                        .await?;

                    if let Some(tag) = tag {
                        return Ok(tag);
                    } else {
                        return Err(rspc::Error::new(
                            ErrorCode::NotFound,
                            "Tag not found".to_string(),
                        ));
                    }
                },
            )

        })
        .query("get_tags", |t| {
            t(|ctx: Ctx, _: ()| async move {
                let tags = ctx.client.tag().find_many(vec![]).exec().await?;
                Ok(tags)
            })
        })
}
