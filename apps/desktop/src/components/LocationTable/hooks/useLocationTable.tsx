import rspc from "../../../lib/query";
import { Add, Activity, Edit, TrashCan } from "@carbon/icons-react";
import {
	useDatagrid,
	useSelectRows,
	useStickyColumn,
	useActionsColumn,
} from "@carbon/ibm-products";
import {
	TableBatchAction,
	TableBatchActions,
} from "@carbon/react";
import dayjs from "dayjs";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br"; // import locale

dayjs.extend(relative);
dayjs.locale("pt-br"); // use locale

import { useEffect, useMemo, useState } from "react";
import { DatagridActions } from "../../../components/Datagrid/DatagridActions";
import { DatagridPagination } from "../utils/DatagridPagination";

interface ILocationTableProps {
	collectionId: number;
}

const useLocationTable = ({ collectionId }: ILocationTableProps) => {
	const {
		data: locations,
		isLoading: isLoadingLocations,
	} = rspc.useQuery([
		"locations.get_all_locations_for_collection",
		{ collection_id: collectionId ? collectionId : 0 },
	]);

	const [data, setData] = useState([]);

	useEffect(() => {
		if (isLoadingLocations) {
			setData([]);
		} else {
			setData(locations);
		}
	}, [isLoadingLocations]);

	const getBatchActions = () => {
		return [
			{
				label: "Deletar",
				renderIcon: (props) => <Add size={16} {...props} />,
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

	const columns = useMemo(
		() => [
			{
				Header: "id",
				accessor: "id",
				width: 50,
			},
			{
				Header: "Nome",
				accessor: "name",
				width: 200,
			},
			{
				Header: "Caminho",
				accessor: "path",
				width: 600,
			},
			{
				Header: "Criado em",
				accessor: "date_created",
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
				onClick: () => console.log("Clicked row action: delete"),
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
			isFetching: isLoadingLocations,
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
		useActionsColumn,
		useStickyColumn,
	);

	return {
		datagridState,
	};
};

export default useLocationTable;
