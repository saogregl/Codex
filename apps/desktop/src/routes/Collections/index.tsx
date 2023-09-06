/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader } from "@carbon/ibm-products";

import { Theme } from "@carbon/react";
import useThemeStore from "../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../constants/defaultPageHeader";
import useCollections from "../../hooks/useCollections";
import { TableBatchAction, TableBatchActions } from "@carbon/react";
import { Add, Activity, Edit, TrashCan } from "@carbon/icons-react";

import dayjs from "dayjs";
import relative from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br"; // import locale

dayjs.extend(relative);
dayjs.locale("pt-br"); // use locale


import {
	Datagrid,
	useDatagrid,
	useSelectRows,
	useSelectAllWithToggle,
	useStickyColumn,
	useActionsColumn,
    getAutoSizedColumnWidth,
} from "@carbon/ibm-products";
import { useEffect, useMemo, useState } from "react";
import { DatagridActions } from "../../components/Datagrid/DatagridActions";

const index = () => {
	const { theme } = useThemeStore();
	const { collections, isLoadingcollections, errorCollections } =
		useCollections();

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

	const getBatchActions = () => {
		return [
			{
				label: "Duplicate",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
			},
			{
				label: "Add",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
			},
			{
				label: "Publish to catalog",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
			},
			{
				label: "Download",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
			},
			{
				label: "Delete",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
				hasDivider: true,
				kind: "danger",
			},
		];
	};

	const [data, setData] = useState([]);

	useEffect(() => {
		if (isLoadingcollections) {
			setData([]);
		} else {
			setData(collections);
		}
	}, [isLoadingcollections]);

	const columns = useMemo(
		() => [
			{
				Header: "id",
				accessor: "id",
			},
			{
				Header: "UUID",
				accessor: "uuid",

			},
			{
				Header: "ID da biblioteca",
				accessor: "libraryId",
			},
			{
				Header: "Nome",
				accessor: "name",
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
				onClick: console.log("Clicked row action: edit"),
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
			isFetching: isLoadingcollections,
			batchActions: true,
			toolbarBatchActions: getBatchActions(),
			DatagridActions,
			DatagridBatchActions,
			rowActions: getRowActions(),
			onSelectAllRows: () => console.log("onSelectAll batch action callback"),
		},
		useSelectRows,
		useSelectAllWithToggle,
		useActionsColumn,
		useStickyColumn,
	);

	return (
		<div>
			<Theme theme={theme}>
				<PageHeader
					{...defaultPageHeaderProps}
					breadcrumbs={[
						{
							href: "/Data",
							key: "Breadcrumb 1",
							label: "Data",
						},
					]}
					title={"Bem vindo, Lucas!"}
					subtitle={"Aqui você ver e gerenciar suas coleções."}
				/>
			</Theme>
			<div style={{ width: "100%", height: "100%" }}>
				<Datagrid datagridState={datagridState} />
			</div>
		</div>
	);
};

export default index;
