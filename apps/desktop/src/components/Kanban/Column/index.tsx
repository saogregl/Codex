// @format
import classnames from "classnames";
import { useContext, useEffect, useRef, useState } from "react";
import { settings } from "../../../constants/settings";
import Issue from "../Issue";
//ts-ignore
import { Droppable } from "@hello-pangea/dnd";
import rspc from "../../../lib/query";
import { FilterContext } from "../../../context/FilterContext";
import { ProjectLists } from "../../../../web/src/bindings";
import AddIssueButton from "../AddIssue/addIssueButton";

const sipePrefix = settings.sipePrefix;

interface Props {
  list: ProjectLists;
  itemKey: number;
  // dataChangedCallback: () => void;
}

function KanbanList(props: Props) {
  const { data: listTask } = rspc.useQuery([
    "tasks.getTasksFromList",
    { list_id: props.list.listID },
  ]);

  const filterContext = useContext(FilterContext);

  const searchString = filterContext?.searchString;

  const filteredTasks = listTask
    ?.filter((task) =>
      task?.title?.toLowerCase().includes(searchString.toLowerCase())
    )
    .sort((a, b) => a.position - b.position);

  const ele = useRef<HTMLDivElement>();

  const isScrollable = function (ele) {
    const hasScrollableContent = ele.scrollHeight
      ? ele.scrollHeight > ele.clientHeight
      : false;

    // It's not enough because the element's `overflow-y` style can be set as
    // * `hidden`
    // * `hidden !important`
    // In those cases, the scrollbar isn't shown
    const overflowYStyle = window.getComputedStyle(ele).overflowY;
    const isOverflowHidden = overflowYStyle.indexOf("hidden") !== -1;

    return hasScrollableContent && !isOverflowHidden;
  };

  const [isScrollableElement, setIsScrollableElement] = useState(false);
  useEffect(() => {
    setIsScrollableElement(isScrollable(ele.current));
  }, [ele.current]);


  return (
    <Droppable key={props.itemKey} droppableId={props.list.listID}>
      {(provided) => (
        <div className={classnames(`${settings.sipePrefix}--kanban-column`)}>
          <div
            className={classnames(
              `${settings.sipePrefix}--kanban-column-title`
            )}
          >
            {props.list.title}
          </div>
          <AddIssueButton listID={props.list.listID} />
          <div
            className={classnames(
              `${settings.sipePrefix}--kanban-card-column-wrapper`,
              isScrollableElement
                ? `${settings.sipePrefix}--scrollable-column`
                : ""
            )}
            ref={ele}
            style={{minHeight: "150px"}}
          >
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {filteredTasks?.map((task, index) => {
                return <Issue issue={task} key={task.id} index={index} />;
              })}
              {provided.placeholder}
            </div>
          </div>
        </div>
      )}
    </Droppable>
  );
}

export default KanbanList;
