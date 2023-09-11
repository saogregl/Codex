/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader, getAutoSizedColumnWidth } from "@carbon/ibm-products";
import { Row } from "@tanstack/react-table";
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
	Button,
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
import LocationTable from "../../components/LocationTable";
import useCollectionsForm from "../../hooks/useCollectionsForm";
import { Collection } from "../../../../../web/src/bindings";
import { CreateCollection } from "../../components/CreateCollection";
import useModalStore from "../../Stores/modalStore";

const index = () => {
	const { theme } = useThemeStore();
	const { collections, isLoadingcollections, errorCollections } =
		useCollections();
	const [open, setOpen] = useState(false);
	const handleModalClick = () => {
		setOpen(!open);
	};

	const [selectedCollection, setSelectedCollection] =
		useState<Collection | null>(null);
	const [selectedCollectionID, setSelectedCollectionID] = useState<number>(0);
	const [CreateCollectionIsOpen, SetCreateCollectionIsOpen] = useState(false);

	const DatagridBatchActions = (datagridState) => {
		const { selectedFlatRows, toggleAllRowsSelected } = datagridState;
		const totalSelected = selectedFlatRows?.length;
		const actionName = "Action";

		return (
			<TableBatchActions
				shouldShowBatchActions={totalSelected > 0}
				totalSelected={totalSelected}
				onCancel={() => toggleAllRowsSelected(false)}
			>
				<TableBatchAction
					renderIcon={(props) => <Activity size={16} {...props} />}
					// onClick={onBatchAction}
				>
					{actionName}
				</TableBatchAction>
			</TableBatchActions>
		);
	};

	const DocumentEditTearsheet = () => {
		const closeTearsheet = () => {
			setOpen(false);
		};

		const {
			errors,
			handleEditCollection,
			handleSubmit,
			isLoading,
			register,
			successfullEdit,
		} = useCollectionsForm({
			collection_id: selectedCollectionID,
			closeTearsheet,
		});

		const onRequestClose = () => {
			SetCreateCollectionIsOpen(false);
		};


		return (
			<>
				<EditTearsheet
					className="c4p--tearsheet-edit-multi-form test-class-name"
					description="Edite as informações da coleção."
					influencerWidth="narrow"
					label="Coleção"
					open={open}
					onClose={() => setOpen(false)}
					submitButtonText="Confirmar"
					title="Editar coleção"
					onHandleModalConfirm={handleSubmit(handleEditCollection)}
					onHandleFormSubmit={handleSubmit(handleEditCollection)}
					onHandleModalCancel={() => setOpen(false)}
					createModalProps={{
						collectionId: selectedCollectionID,
						open: CreateCollectionIsOpen,
						onClose: onRequestClose,
					}}
				>
					<EditTearsheetForm
						description="Essas informações são usadas para identificar sua coleção."
						fieldsetLegendText="Informações da coleção"
						subtitle="Aqui você pode editar as informações da coleção."
						title="Descrição da coleção"
					>
						<Column lg={16} md={8} sm={8} xlg={16}>
							<TextInput
								id="name"
								labelText="Nome da coleção"
								helperText="Digite um nome para ajudar a identificar a coleção."
								{...register("name")}
								invalid={errors.name ? true : false}
								// @ts-ignore
								invalidText={errors.name?.message}
								defaultValue={selectedCollection ? selectedCollection.name : ""}
								disabled={isLoading}
							/>
							<TextInput
								id="description"
								labelText="Descrição da coleção"
								helperText="Digite uma descrição para ajudar a identificar a coleção."
								{...register("description")}
								invalid={errors.description ? true : false}
								// @ts-ignore
								invalidText={errors.description?.message}
								defaultValue={
									selectedCollection ? selectedCollection.description : ""
								}
								disabled={isLoading}
							/>
						</Column>
					</EditTearsheetForm>
					<EditTearsheetForm
						description="Adicione pastas e arquivos a coleção."
						fieldsetLegendText=""
						subtitle="Aqui você pode editar as pastas e arquivos da coleção."
						title="Pastas e arquivos"
					>
						<Column lg={16} md={8} sm={8} xlg={16}>
							<LocationTable collectionId={selectedCollectionID} />
							<Button onClick={() => SetCreateCollectionIsOpen(true)}>
								{" "}
								Adicionar pasta{" "}
							</Button>
						</Column>
					</EditTearsheetForm>
				</EditTearsheet>
			</>
		);
	};

	const getBatchActions = () => {
		return [
			{
				label: "Delete",
				renderIcon: (props) => <TrashCan size={16} {...props} />,
				// onClick: console.log("Clicked batch action button"),
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
	}, [isLoadingcollections, collections]);

	const columns = useMemo(
		() => [
			{
				Header: "ID",
				accessor: "id",
			},
			{
				Header: "Nome",
				accessor: "name",
				width: 200,
			},
			{
				Header: "Descrição",
				accessor: "description",
				width: 600,
			},
			{
				Header: "Criado",
				accessor: "date_created",
				Cell: ({ cell: { value } }) => <span>{dayjs(value).fromNow()}</span>,
			},
			{
				Header: "Modificado",
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
		[isLoadingcollections],
	);

	const handleEditClick = (collection: Collection) => {
		setSelectedCollectionID(collection.id);
		setSelectedCollection({ ...collection });
		setOpen(true);
	};

	const getRowActions = () => {
		return [
			{
				id: "edit",
				itemText: "Editar",
				icon: Edit,
				onClick: (
					actionId: string,
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					row: any,
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					event: any,
				) => handleEditClick(row.original),
			},
			{
				id: "delete",
				itemText: "Deletar",
				icon: TrashCan,
				isDelete: true,
				// onClick: console.log("Clicked row action: delete"),
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
			// onSelectAllRows: () => console.log("onSelectAll batch action callback"),
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
