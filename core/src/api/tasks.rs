use super::Ctx;
use crate::prisma;
pub use rspc::RouterBuilder;
use specta::Type;
use serde::{Deserialize, Serialize};

pub fn mount() -> RouterBuilder<Ctx> {
    RouterBuilder::<Ctx>::new()
        .query("getAllProjectActivities", |t| {
            t(|ctx: Ctx, _: ()| async move {
                ctx.client
                    .project_activities()
                    .find_many(vec![])
                    .exec()
                    .await
                    .unwrap()
            })
        })
        .query("getListsFromProject", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetArgs {
                project_id: i32,
            }

            t(|ctx: Ctx, GetArgs { project_id }: GetArgs| async move {
                ctx.client
                    .project_lists()
                    .find_many(vec![prisma::project_lists::project_id::equals(Some(
                        project_id.into(),
                    ))])
                    .exec()
                    .await
                    .unwrap()
            })
        })
        .query("getTasksFromList", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetTaskFromListArgs {
                list_id: String,
            }

            t(
                |ctx: Ctx, GetTaskFromListArgs { list_id }: GetTaskFromListArgs| async move {
                    ctx.client
                        .project_activities()
                        .find_many(vec![prisma::project_activities::task_list_id::equals(
                            Some(list_id),
                        )])
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .query("getTaskByID", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct GetTaskByIDArgs {
                task_id: String,
            }

            t(
                |ctx: Ctx, GetTaskByIDArgs { task_id }: GetTaskByIDArgs| async move {
                    ctx.client
                        .project_activities()
                        .find_unique(prisma::project_activities::id::equals(task_id.into()))
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .mutation("MoveTaskByIDAndUpdateBoard", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct MoveTaskByIDArgs {
                task_id: String,
                list_id: String,
                position: i32,
            }

            t(
                |ctx: Ctx,
                 MoveTaskByIDArgs {
                     task_id,
                     list_id,
                     position,
                 }: MoveTaskByIDArgs| async move {
                    let old_position = ctx
                        .client
                        .project_activities()
                        .find_unique(prisma::project_activities::id::equals(String::from(
                            task_id.clone(),
                        )))
                        .exec()
                        .await
                        .unwrap()
                        .unwrap()
                        .position
                        .unwrap();

                    let old_list = ctx
                        .client
                        .project_activities()
                        .find_unique(prisma::project_activities::id::equals(String::from(
                            task_id.clone(),
                        )))
                        .exec()
                        .await
                        .unwrap()
                        .unwrap()
                        .task_list_id
                        .unwrap();

                    let same_list = old_list == list_id;

                    ctx.client
                        .project_activities()
                        .update(
                            prisma::project_activities::id::equals(String::from(task_id.clone())),
                            vec![
                                prisma::project_activities::task_list_id::set(Some(String::from(
                                    list_id.clone(),
                                )).into()),
                                prisma::project_activities::position::set(Some(position)),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap();

                    //Check if we are moving into a different list or not
                    if same_list {
                        // Then if we are moving the task to a different list, we need to update the position of all the other tasks in the destination list,
                        // moving the tasks after the moved task to a lower position (by incrementing their position)

                        ctx.client
                            .project_activities()
                            .update_many(
                                vec![
                                    prisma::project_activities::task_list_id::equals(Some(
                                        String::from(list_id.clone()),
                                    )),
                                    prisma::project_activities::position::gt(position),
                                ],
                                vec![prisma::project_activities::position::increment(1)],
                            )
                            .exec()
                            .await
                            .unwrap();

                        // Finally we need to update the position of all the tasks in the list that the task was moved from, moving the tasks after the moved task to a higher position (by decrementing their position)
                        ctx.client
                            .project_activities()
                            .update_many(
                                vec![
                                    prisma::project_activities::task_list_id::equals(Some(
                                        String::from(list_id.clone()),
                                    )),
                                    prisma::project_activities::position::gt(position),
                                ],
                                vec![prisma::project_activities::position::decrement(1)],
                            )
                            .exec()
                            .await
                            .unwrap();
                    } else {
                        //If we are moving in the same list, we need to check if the task is being moved up or down and update the position of the tasks between the old and new position of the moved task

                        if old_position > position {
                            // If the task is being moved up, we need to update the position of the tasks between the old and new position of the moved task
                            ctx.client
                                .project_activities()
                                .update_many(
                                    vec![
                                        prisma::project_activities::task_list_id::equals(Some(
                                            String::from(list_id.clone()),
                                        )),
                                        prisma::project_activities::position::gt(position),
                                        prisma::project_activities::position::lte(old_position),
                                    ],
                                    vec![prisma::project_activities::position::increment(1)],
                                )
                                .exec()
                                .await
                                .unwrap();
                        } else if old_position < position {
                            // If the task is being moved down, we need to update the position of the tasks between the old and new position of the moved task
                            ctx.client
                                .project_activities()
                                .update_many(
                                    vec![
                                        prisma::project_activities::task_list_id::equals(Some(
                                            String::from(list_id.clone()),
                                        )),
                                        prisma::project_activities::position::gte(old_position),
                                        prisma::project_activities::position::lt(position),
                                    ],
                                    vec![prisma::project_activities::position::decrement(1)],
                                )
                                .exec()
                                .await
                                .unwrap();
                        } else {
                            // If the task is being moved to the same position, we don't need to update the position of any tasks
                        }
                    }
                    // Lastly we need to move the task to the new list and update its position
                },
            )
        })
        .mutation("MoveTaskByID", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct MoveTaskByIDArgs {
                task_id: String,
                list_id: String,
                position: i32,
            }

            t(
                |ctx: Ctx,
                 MoveTaskByIDArgs {
                     task_id,
                     list_id,
                     position,
                 }: MoveTaskByIDArgs| async move {
                    ctx.client
                        .project_activities()
                        .update(
                            prisma::project_activities::id::equals(task_id.into()),
                            vec![
                                prisma::project_activities::task_list_id::set(Some(list_id)),
                                prisma::project_activities::position::set(Some(position)),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .mutation("EditTaskByID", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct EditTaskByIDArgs {
                Project_id: i32,
                task_id: String,
                title: String,
                description: String,
                due_date: Option<String>,
                priority: Option<String>,
                status: Option<String>,
            }

            t(
                |ctx: Ctx,
                 EditTaskByIDArgs {
                     Project_id,
                     task_id,
                     title,
                     description,
                     due_date: _,
                     priority,
                     status,
                 }: EditTaskByIDArgs| async move {
                    ctx.client
                        .project_activities()
                        .update(
                            prisma::project_activities::id::equals(task_id.into()),
                            vec![
                                prisma::project_activities::title::set(Some(title)),
                                prisma::project_activities::project_id::set(Some(Project_id)),
                                prisma::project_activities::description::set(Some(description)),
                                prisma::project_activities::priority::set(priority),
                                prisma::project_activities::status::set(status),
                            ],
                        )
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .mutation("createNewTask", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct CreateNewTaskArgs {
                Project_id: i32,
                list_id: String,
                title: String,
                description: String,
                status: String,
                position: i32,
            }
            t(
                |ctx: Ctx,
                 CreateNewTaskArgs {
                     Project_id,
                     list_id,
                     title,
                     description,
                     status,
                     position,
                 }: CreateNewTaskArgs| async move {
                    ctx.client
                        .project_activities()
                        .create(vec![
                            prisma::project_activities::task_list_id::set(Some(list_id)),
                            prisma::project_activities::title::set(Some(title)),
                            prisma::project_activities::project_id::set(Some(Project_id)),
                            prisma::project_activities::description::set(Some(description)),
                            prisma::project_activities::status::set(Some(status)),
                            prisma::project_activities::position::set(Some(position)),
                        ])
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .mutation("addNewTaskToColumn", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct AddTaskToColumnArgs {
                Project_id: i32,
                list_id: String,
                title: String,
                description: String,
                status: String,
            }
            t(
                |ctx: Ctx,
                 AddTaskToColumnArgs {
                     Project_id,
                     list_id,
                     title,
                     description,
                     status,
                 }: AddTaskToColumnArgs| async move {
                    //We need to add a new task at the start of the list and move all the other tasks down by one
                    //Get all tasks for current list
                    let tasks = ctx
                        .client
                        .project_activities()
                        .find_many(vec![prisma::project_activities::task_list_id::equals(
                            Some(list_id.clone()),
                        )])
                        .exec()
                        .await
                        .unwrap();

                    //Update all tasks to have a position of +1

                    for task in tasks {
                        ctx.client
                            .project_activities()
                            .update(
                                prisma::project_activities::id::equals(task.id),
                                vec![prisma::project_activities::position::set(Some(
                                    task.position.unwrap() + 1,
                                ))],
                            )
                            .exec()
                            .await
                            .unwrap();
                    }

                    //Add new task at position 0

                    ctx.client
                        .project_activities()
                        .create(vec![
                            prisma::project_activities::task_list_id::set(Some(list_id)),
                            prisma::project_activities::title::set(Some(title)),
                            prisma::project_activities::project_id::set(Some(Project_id)),
                            prisma::project_activities::description::set(Some(description)),
                            prisma::project_activities::status::set(Some(status)),
                            prisma::project_activities::position::set(Some(0)),
                        ])
                        .exec()
                        .await
                        .unwrap()
                },
            )
        })
        .mutation("deleteTaskByID", |t| {
            #[derive(Debug, Clone, Deserialize, Serialize, Type)]
            struct DeleteTaskByIDArgs {
                task_id: String,
            }

            t(
                |ctx: Ctx, DeleteTaskByIDArgs { task_id }: DeleteTaskByIDArgs| async move {
                    //Get the position of the task we are deleting
                    let task = ctx
                        .client
                        .project_activities()
                        .find_first(vec![prisma::project_activities::id::equals(
                            task_id.clone(),
                        )])
                        .exec()
                        .await
                        .unwrap();

                    let position = task.as_ref().unwrap().position.unwrap();
                    let list_id = task.as_ref().unwrap().task_list_id.as_ref().unwrap();

                    ctx.client
                        .project_activities()
                        .delete(prisma::project_activities::id::equals(task_id.into()))
                        .exec()
                        .await
                        .unwrap();

                    //We also need to update the position of all tasks after the deleted task
                    //Get all tasks for current list
                    let tasks = ctx
                        .client
                        .project_activities()
                        .find_many(vec![prisma::project_activities::task_list_id::equals(
                            Some(list_id.clone()),
                        )])
                        .exec()
                        .await
                        .unwrap();

                    //Update all tasks after the deleted task to have a position of -1

                    for task in tasks {
                        if task.position.unwrap() > position {
                            ctx.client
                                .project_activities()
                                .update(
                                    prisma::project_activities::id::equals(task.id),
                                    vec![prisma::project_activities::position::set(Some(
                                        task.position.unwrap() - 1,
                                    ))],
                                )
                                .exec()
                                .await
                                .unwrap();
                        }
                    }
                },
            )
        })
}
