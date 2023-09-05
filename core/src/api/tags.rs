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
                    ctx.client
                        .tag()
                        .create(vec![
                            tag::name::set(Some(name)),
                            tag::color::set(Some(color)),
                            tag::date_created::set(Some(Utc::now().into())),
                            tag::date_modified::set(Some(Utc::now().into())),
                        ])
                        .exec()
                        .await
                        .unwrap();
                },
            )
        })
        .mutation("add_tag_to_object", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddTagToObjectArgs {
                tag_uuid: String,
                object_uuid: String,
            }
            t(
                |ctx: Ctx,
                 AddTagToObjectArgs {
                     tag_uuid,
                     object_uuid,
                 }: AddTagToObjectArgs| async move {
                    let (tag, objects) = ctx
                        .client
                        ._batch((
                            ctx.client
                                .tag()
                                .find_unique(tag::uuid::equals(tag_uuid.clone())),
                            ctx.client
                                .object()
                                .find_many(vec![object::uuid::equals(object_uuid.clone())]),
                        ))
                        .await
                        .unwrap();

                    let tag = tag
                        .ok_or_else(|| {
                            rspc::Error::new(ErrorCode::NotFound, "Tag not found".to_string())
                        })
                        .unwrap();

                    ctx.client
                        .tag_on_object()
                        .create(
                            tag::uuid::equals(tag_uuid.clone()),
                            object::uuid::equals(object_uuid.clone()),
                            vec![
                                tag_on_object::tag_id::set(tag_uuid.clone()),
                                tag_on_object::object_id::set(object_uuid.clone()),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();
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
        .query("get_tags", |t| {
            t(|ctx: Ctx, _: ()| async move {
                let tags = ctx.client.tag().find_many(vec![]).exec().await?;
                Ok(tags)
            })
        })
}
