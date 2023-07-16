import { WorkspaceActivities } from "../../../../web/src/bindings";
import { insertItemIntoArray } from "../utils/kanbanUtils";
import rspc, { queryClient } from "../../../lib/query";

const useBoard = () => {
  const { mutateAsync: MoveTaskByID, isSuccess } = rspc.useMutation(
    "tasks.MoveTaskByID",
    {
      onSuccess: () => {
        console.log("onSuccess ");
      },
      onError: (error) => {
        console.log(error);
        queryClient.invalidateQueries(["tasks.getTasksFromList"]);
      },
    }
  );

  const isPositionChanged = (
    destination: { droppableId: any; index: any },
    source: { droppableId: any; index: any }
  ) => {
    if (!destination) return false;
    const isSameList = destination.droppableId === source.droppableId;
    const isSamePosition = destination.index === source.index;
    return !isSameList || !isSamePosition;
  };

  const resolveAfterDropIssues = ({
    taskToDrop,
    dropFromIndex,
    dropToIndex,
    listToDrop,
    sourceList,
    sourceListID,
    dropToListID,
  }: {
    taskToDrop: WorkspaceActivities;
    dropFromIndex: number;
    dropToIndex: number;
    listToDrop: WorkspaceActivities[];
    sourceList: WorkspaceActivities[];
    sourceListID: string;
    dropToListID: string;
  }) => {
    const isSameList = sourceListID === dropToListID;
    if (isSameList) {
      taskToDrop.position = dropToIndex;
      const direction = dropToIndex < dropFromIndex ? 1 : -1;
      const newList = sourceList.map((task: WorkspaceActivities) => {
        if (
          task.position >= dropToIndex &&
          task.position < dropFromIndex &&
          task.id !== taskToDrop.id
        ) {
          //If the task has moved Up, we need to increment the position of the tasks that are between the old and new position
          return { ...task, position: task.position - direction };
        }
        return task;
      });

      //insert

      return {
        newSourceList: newList,
        newDropToList: newList,
      };
    }

    const newSourceList = sourceList
      .filter((task) => task.id !== taskToDrop.id)
      .map((task: WorkspaceActivities) => {
        if (task.position > taskToDrop.position) {
          return { ...task, position: task.position - 1 };
        }
        return task;
      });

    //Add item to destination array
    let newDropToList = listToDrop.map((task: WorkspaceActivities) => {
      if (task.position >= dropToIndex) {
        return { ...task, position: task.position + 1 };
      }
      return task;
    });
    newDropToList = insertItemIntoArray(newDropToList, taskToDrop, dropToIndex);

    return {
      newSourceList,
      newDropToList,
    };
  };

  function optimisticUpdate({
    newSourceList,
    newDropToList,
    dropToListID,
    sourceListID,
  }: {
    newSourceList: WorkspaceActivities[];
    newDropToList: WorkspaceActivities[];
    dropToListID: string;
    sourceListID: string;
  }) {
    const isSameList = sourceListID === dropToListID;

    console.log("new Source list", newSourceList);
    if (isSameList) {
      queryClient.setQueriesData(
        ["tasks.getTasksFromList", { list_id: sourceListID }],
        (old) => [...newSourceList]
      );
      return;
    }
    queryClient.setQueriesData(
      ["tasks.getTasksFromList", { list_id: sourceListID }],
      (old) => [...newSourceList]
    );

    queryClient.setQueriesData(
      ["tasks.getTasksFromList", { list_id: dropToListID }],
      (old) => [...newDropToList]
    );
  }

  const updateBoard = async ({
    taskToDrop,
    listToDrop,
    sourceList,
    dropFromIndex,
    dropToIndex,
    sourceListID,
    dropToListID,
  }: {
    taskToDrop: WorkspaceActivities;
    listToDrop: WorkspaceActivities[];
    sourceList: WorkspaceActivities[];
    dropFromIndex: number;
    dropToIndex: number;
    sourceListID: string;
    dropToListID: string;
  }) => {
    //Check if itens are in the same list
    const isSameList = sourceListID === dropToListID;
    if (isSameList) {
      const taskToInsertPromise = MoveTaskByID({
        task_id: taskToDrop.id,
        list_id: dropToListID,
        position: dropToIndex,
      });

      const sourceListPromises = sourceList.map((task: WorkspaceActivities) => {
        //If the task has moved Up, we need to increment the position of the tasks that are between the old and new position
        //If the task has moved Down, we need to decrement the position of the tasks that are between the old and new position
        const direction = dropToIndex < dropFromIndex ? 1 : -1;

        if (
          task.position >= dropToIndex &&
          task.position < dropFromIndex &&
          task.id !== taskToDrop.id
        ) {
          return Promise.resolve({
            task_id: task.id,
            promise: MoveTaskByID({
              task_id: task.id,
              list_id: dropToListID,
              position: task.position + direction,
            }),
          });
        }
      });

      return Promise.all([...sourceListPromises, taskToInsertPromise]);
    }

    const sourceListPromises = sourceList
      .filter((task) => task.id !== taskToDrop.id)
      .map(async (task: WorkspaceActivities) => {
        if (task.position > dropFromIndex) {
          return Promise.resolve({
            task_id: task.id,
            promise: await MoveTaskByID({
              task_id: task.id,
              list_id: sourceListID,
              position: task.position - 1,
            }),
          });
        }
      });

    //Update item position
    const taskToInsertPromise = Promise.resolve({
      task_id: taskToDrop.id,
      promise: await MoveTaskByID({
        task_id: taskToDrop.id,
        list_id: dropToListID,
        position: dropToIndex,
      }),
    });

    const destinationListPromises = listToDrop.map(
      async (task: WorkspaceActivities) => {
        if (task.position >= dropToIndex) {
          return Promise.resolve({
            task_id: task.id,
            promise: await MoveTaskByID({
              task_id: task.id,
              list_id: dropToListID,
              position: task.position + 1,
            }),
          });
        }
      }
    );
    return Promise.all([
      ...sourceListPromises,
      ...destinationListPromises,
      taskToInsertPromise,
    ]);
  };

  const getCachedQueries = ({
    dropToListID,
    sourceListID,
  }: {
    dropToListID: string;
    sourceListID: string;
  }) => {
    const [[_queryKey1, listToDrop]] = queryClient.getQueriesData<
      WorkspaceActivities[]
    >({
      queryKey: ["tasks.getTasksFromList", { list_id: dropToListID }],
    });
    const [[_queryKey2, sourceList]] = queryClient.getQueriesData<
      WorkspaceActivities[]
    >({
      queryKey: ["tasks.getTasksFromList", { list_id: sourceListID }],
    });

    return {
      listToDrop,
      sourceList,
    };
  };

  const onDragEnd = async ({ destination, source, draggableId }) => {

    console.log("onDragEnd")
    console.log("destination", destination)
    console.log("source", source)
    console.log("draggableId", draggableId)

    if (!isPositionChanged(destination, source)) return;

    const dropToListID = destination.droppableId;
    const taskToDropID = draggableId;
    const dropFromIndex = source.index; //position to drop in the destination list
    const dropToIndex = destination.index;

    const { listToDrop, sourceList } = getCachedQueries({
      dropToListID,
      sourceListID: source.droppableId,
    });

    //get Task to drop ID from sourceList
    const taskToDrop = sourceList.find(
      (task: WorkspaceActivities) => task.id === taskToDropID
    );

    const { newDropToList, newSourceList } = resolveAfterDropIssues({
      taskToDrop,
      dropFromIndex,
      dropToIndex,
      listToDrop,
      sourceList,
      sourceListID: source.droppableId,
      dropToListID: destination.droppableId,
    });

    //optimistic update first:
    optimisticUpdate({
      newSourceList,
      newDropToList,
      dropToListID,
      sourceListID: source.droppableId,
    });

    //update

    await updateBoard({
      taskToDrop,
      listToDrop,
      sourceList,
      dropFromIndex,
      dropToIndex,
      sourceListID: source.droppableId,
      dropToListID,
    }).then(() => {
      queryClient.invalidateQueries([
        "tasks.getTasksFromList",
        { list_id: dropToListID },
      ]);
      queryClient.invalidateQueries([
        "tasks.getTasksFromList",
        { list_id: source.droppableId },
      ]);
    });
  };

  return { onDragEnd };
};

export default useBoard; 