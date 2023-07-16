import React from "react";
import { settings } from "../../../constants/settings";
import classnames from "classnames";
import { Draggable } from "@hello-pangea/dnd";


import {
  // @ts-ignore

  OverflowMenuItem,
  // @ts-ignore

  OverflowMenu,
  // @ts-ignore

  Tag
} from "@carbon/react";

import { Link } from "react-router-dom";
import Avatar from "../../Avatar";
import useStore from "../../../Stores/sessionStore";
import rspc, { queryClient } from "../../../lib/query";
import type { ProjectActivities } from "../../../../web/src/bindings";

const sipePrefix = settings.sipePrefix;

interface Props {
  issue: ProjectActivities;
  key: string;
  index: number;
}

interface Tags {
  color: string;
  content: string;
}

const renderTags = (tags: Tags[]) => {
  return tags.map((tag) => {
    return (
      <Tag key={tag.content} type={tag.color} size="sm">
        {tag.content}
      </Tag>
    );
  });
};

function Issue(props: Props) {

  console.log(props)
  const { id, title, description, assigned, createdBy, taskListID } =
    props.issue;

  //Get list id from task
  const sourceListID = props.issue.taskListID;

  const { mutate: deleteTaskByID } = rspc.useMutation("tasks.deleteTaskByID", {
    onSuccess: () => {
      queryClient.invalidateQueries([
        "tasks.getTasksFromList",
        {
          list_id: taskListID,
        },
      ]);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const userProfile = useStore();
  const fullName =
    // @ts-ignore-next-line

    userProfile.userSession.session.user.user_metadata?.first_name +
    " " +
    // @ts-ignore-next-line

    userProfile.userSession.session.user.user_metadata?.last_name;

  return (
    <Draggable key={props.issue.id} draggableId={props.issue.id} index={props.index}>
      {(provided, snapshot) => (
        <Link
          style={{ textDecoration: "none" }}
          to={`/Dashboard/Planner/${id}`}
        >
          <div
            onClick={() => {
              console.log("click");
            }}
            className={classnames(`${settings.sipePrefix}--kanban-issue`)}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div
              className={classnames(
                `${settings.sipePrefix}--kanban-issue-header`
              )}
            >
              <div
                className={classnames(
                  `${settings.sipePrefix}--kanban-tag-container`
                )}
              >
                {renderTags([
                  {
                    color: "blue",
                    content: "",
                  },
                  {
                    color: "green",
                    content: "",
                  },
                ])}
              </div>
              <OverflowMenu
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                aria-label="overflow-menu"
                align="bottom"
              >
                <OverflowMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  itemText="Definir responsável"
                />
                <OverflowMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  itemText="Copiar tarefa"
                />
                <OverflowMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  itemText="Criar Link para tarefa"
                />
                <OverflowMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  itemText="Mover tarefa"
                />
                <OverflowMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteTaskByID({
                      task_id: id,
                    });
                  }}
                  hasDivider
                  isDelete
                  itemText="Deletar tarefa"
                />
              </OverflowMenu>
            </div>
            <div
              className={classnames(
                `${settings.sipePrefix}--kanban-issue-title`
              )}
            >
              <p>{title}</p>
            </div>
            <div
              className={classnames(
                `${settings.sipePrefix}--kanban-issue-content`
              )}
            >
              {description}
              <div
                className={classnames(
                  `${settings.sipePrefix}--kanban-issue-footbar`
                )}
              >
                <Avatar size={32} userName={fullName} />
              </div>
            </div>
          </div>
        </Link>
      )}
    </Draggable>
  );
}

export default Issue;
