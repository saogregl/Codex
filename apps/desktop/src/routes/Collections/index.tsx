/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader } from "@carbon/ibm-products";

import { Theme } from "@carbon/react";
import useThemeStore from "../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../constants/defaultPageHeader";
import useCollections from "../../hooks/useCollections";
import {
	TableBatchAction,
	TableBatchActions,
	TextInput,
	Column,
	Toggle,
	NumberInput,
	RadioButton,
	RadioButtonGroup,
} from "@carbon/react";
import { Add, Activity, Edit, TrashCan } from "@carbon/icons-react";
import { useClickOutside } from "../../hooks/useClickOutside";

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
} from "@carbon/ibm-products";
import { useEffect, useMemo, useRef, useState } from "react";
import { DatagridActions } from "../../components/Datagrid/DatagridActions";
import { EditTearsheetForm, EditTearsheet } from "../../components/TearSheet";

const index = () => {
	const { theme } = useThemeStore();
	const { collections, isLoadingcollections, errorCollections } =
		useCollections();
	const [open, setOpen] = useState(false);
	const handleModalClick = () => {
		setOpen(!open);
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

	const DocumentEditTearsheet = () => {
		return (
			<Theme theme={theme === "g10" ? "g100" : "g10"}>
				<EditTearsheet
					className="c4p--tearsheet-edit-multi-form test-class-name"
					description="Edite as informações da coleção."
					influencerWidth="narrow"
					label=""
					open={open}
					onClose={() => setOpen(false)}
					submitButtonText="Confirmar"
					title="Editar coleção"
					onHandleModalConfirm={() => console.log("action")}
					onHandleModalCancel={() => setOpen(false)}
				>
					<EditTearsheetForm
						description="Essas informações são usadas para identificar sua coleção."
						fieldsetLegendText="Informações da coleção"
						subtitle="Aqui você pode editar as informações da coleção."
						title="Descrição da coleção"
					>
						<Column lg={8} md={8} sm={8} xlg={8}>
							<TextInput
								id="tearsheet-multi-form-story-text-input-multi-form-1"
								invalidText="This is a required field"
								labelText="Topic name"
								onBlur={() => console.log("action")}
								onChange={() => console.log("action")}
								placeholder="Enter topic name"
								value="Topic name here"
							/>
							<TextInput
								id="tearsheet-multi-form-story-text-input-multi-form-1-input-2"
								labelText="Topic description (optional)"
								onChange={() => console.log("action")}
								placeholder="Enter topic description"
								value="Topic description here"
							/>
							<TextInput
								id="tearsheet-multi-form-story-text-input-multi-form-1-input-3"
								labelText="Topic version (optional)"
								onChange={() => console.log("action")}
								placeholder="Enter topic version"
								value="Topic value here"
							/>
							<Toggle
								className="c4p--tearsheet-edit-multi-form__error--toggle"
								id="simulated-error-toggle"
								labelText="Simulate error"
								onToggle={() => console.log("action")}
								size="sm"
							/>
						</Column>
					</EditTearsheetForm>
					<EditTearsheetForm
						description="Custom form description (see storybook implementation for new custom form capability)"
						fieldsetLegendText=""
						subtitle="Custom form subtitle"
						title="Location"
					>
						<Column lg={8} md={8} sm={8} xlg={8}>
							<TextInput
								id="custom-form-input"
								labelText="Location"
								onChange={() => console.log("action")}
								placeholder="Enter location"
								value="Location here"
							/>
						</Column>
					</EditTearsheetForm>
				</EditTearsheet>
			</Theme>
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
				label: "Delete",
				renderIcon: (props) => <Add size={16} {...props} />,
				onClick: console.log("Clicked batch action button"),
				hasDivider: true,
				kind: "tertiary",
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
				onClick: () => setOpen(true),
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
				<DocumentEditTearsheet />
				<Datagrid datagridState={datagridState} />
			</div>
		</div>
	);
};

export default index;
