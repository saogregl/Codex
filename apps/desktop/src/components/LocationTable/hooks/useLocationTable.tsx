import rspc from "../../../lib/query";
import { Add, Activity, Edit, TrashCan } from "@carbon/icons-react";
import {
    Datagrid,
    useDatagrid,
    useSelectRows,
    useSelectAllWithToggle,
    useStickyColumn,
    useActionsColumn,
    useInfiniteScroll
} from "@carbon/ibm-products";
import {
    TableBatchAction,
    TableBatchActions,
    TextInput,
    Column,
} from "@carbon/react";
import dayjs from "dayjs";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br"; // import locale

dayjs.extend(relative);
dayjs.locale("pt-br"); // use locale

import { useEffect, useMemo, useRef, useState } from "react";
import { DatagridActions } from "../../../components/Datagrid/DatagridActions";
import useCollections from "../../../hooks/useCollections";
import { DatagridPagination } from "../utils/DatagridPagination";

interface ILocationTableProps {
    collectionId: number
}

const useLocationTable = ({ collectionId }: ILocationTableProps) => {

    const {
        data: objects,
        isLoading: isLoadingObjects,
        error: errorObjects,
    } = rspc.useQuery(["collections.get_all_objects_in_collection", { collection_id: collectionId }], {});


    const [data, setData] = useState([]);

    useEffect(() => {
        if (isLoadingObjects) {
            setData([]);
        } else {
            setData(objects);
        }
    }, [isLoadingObjects]);

    const getBatchActions = () => {
        return [
            {
                label: "Duplicate",
                renderIcon: (props) => <Add size={16} {...props} />,
                onClick: console.log("Clicked batch action button"),
            },
            {
                label: "Delete",
                renderIcon: (props) => <Add size={16} {...props} />,
                onClick: console.log("Clicked batch action button"),
                hasDivider: true,
                kind: "tertiary",
            },
        ];
    };


    const DatagridBatchActions = (datagridState) => {
        const { selectedFlatRows, toggleAllRowsSelected } = datagridState;
        const totalSelected = selectedFlatRows?.length;
        const onBatchAction = () => alert("Batch action");
        const actionName = "Action";

        return (
            <TableBatchActions
                shouldShowBatchActions={totalSelected > 0}
                totalSelected={totalSelected}
                onCancel={() => toggleAllRowsSelected(false)}
            >
                <TableBatchAction
                    renderIcon={(props) => <Activity size={16} {...props} />}
                    onClick={onBatchAction}
                >
                    {actionName}
                </TableBatchAction>
            </TableBatchActions>
        );
    };


    type Object = {
        id: number;
        uuid: string;
        obj_name: string | null;
        kind: number | null;
        hidden: boolean | null;
        favorite: boolean | null;
        important: boolean | null;
        note: string | null;
        date_created: string | null; date_modified: string | null; path: string | null; extension: string | null; relative_path: string | null; parsed_path: string | null; parsed: boolean | null; indexed: boolean | null; thumbnail_path: string | null; thumbnail: boolean | null; libraryId: number; locationId: number; collectionId: number
    }

    const columns = useMemo(
        () => [
            {
                Header: "id",
                accessor: "id",
            },
            {
                Header: "Nome do objeto",
                accessor: "obj_name",
            },
            {
                Header: "Tipo",
                accessor: "kind",
            },
            {
                Header: "Favorito",
                accessor: "favorite",
            },
            {
                Header: "Criado em",
                accessor: "date_created",
                Cell: ({ cell: { value } }) => <span>{dayjs(value).fromNow()}</span>,
            },
            {
                Header: "Modificado em",
                accessor: "date_modified",
                Cell: ({ cell: { value } }) => <span>{dayjs(value).fromNow()}</span>,
            },
            {
                Header: "",
                accessor: "actions",
                sticky: "right",
                isAction: true,
            },
        ],
        [],
    );

    const getRowActions = () => {
        return [
            {
                id: "edit",
                itemText: "Edit",
                icon: Edit,
                onClick: () => console.log("Clicked row action: edit"),
            },
            {
                id: "delete",
                itemText: "Delete",
                icon: TrashCan,
                isDelete: true,
                onClick: console.log("Clicked row action: delete"),
            },
        ];
    };

    const datagridState = useDatagrid(
        {
            columns,
            data,
            emptyStateTitle: "Nenhuma coleção encontrada",
            emptyStateDescription:
                "Crie uma nova coleção para começar a usar o sistema.",
            emptyStateSize: "lg", // See empty state size options from the EmptyState component
            isFetching: isLoadingObjects,
            batchActions: true,
            initialState: {
                pageSize: 10,
                pageSizes: [5, 10, 25, 50],
              },
            toolbarBatchActions: getBatchActions(),
            DatagridActions,
            DatagridBatchActions,
            DatagridPagination,
            rowActions: getRowActions(),
            onSelectAllRows: () => console.log("onSelectAll batch action callback"),
        },
        useSelectRows,
        useSelectAllWithToggle,
        useActionsColumn,
        useStickyColumn,
    );



    return {
        datagridState
    }
}

export default useLocationTable;