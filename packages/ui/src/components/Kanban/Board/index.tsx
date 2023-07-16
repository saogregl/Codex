import KanbanList from "../Column";
import { settings } from "../../../constants/settings";
import classnames from "classnames";
import { DragDropContext } from "@hello-pangea/dnd";
import { Theme } from "@carbon/react";
import { useContext } from "react";
import { FilterContext } from "../../../context/FilterContext";
import rspc from "../../../lib/query";
import useBoard from "./useBoard";

interface KanbanBoardProps {
  projectID: number;
  title: string;
  filterString: string;
}

function KanbanBoard(props: KanbanBoardProps) {

  //TODO: Move this to custom hook and stop using selected project as a prop
  const { onSearchStringChange } = useContext(FilterContext);

  onSearchStringChange(props.filterString);

  const { data, isLoading, error } = rspc.useQuery([
    "tasks.getListsFromProject",
    { project_id: props.projectID },
  ]);
  const {onDragEnd} = useBoard();


  return (
    <Theme theme="g10">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={classnames(`${settings.sipePrefix}--kanban-board`)}>
          {data?.map((list, index) => {
            return <KanbanList itemKey={index} key={index} list={list} />;
          })}
        </div>
      </DragDropContext>
    </Theme>
  );
}

export default KanbanBoard;
