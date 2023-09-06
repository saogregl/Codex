/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PageHeader, EditTearsheet  } from "@carbon/ibm-products";

import { Theme } from "@carbon/react";
import useThemeStore from "../../Stores/themeStore";
import { defaultPageHeaderProps } from "../../constants/defaultPageHeader";
import useCollections from "../../hooks/useCollections";
import { TableBatchAction, TableBatchActions, TextInput, Column, Toggle, RadioButtonGroup, RadioButton, NumberInput, Grid, FormGroup } from "@carbon/react";
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
import { settings } from "../../constants/settings";

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

	const EditTearsheetForm = ({
		children,
		className,
		description,
		fieldsetLegendText,
		hasFieldset,
		subtitle,
		title,
		...rest
  
	}) => {

		const blockClass = `${settings.sipePrefix}--tearsheet-edit__form`;

		return (
			<Grid>
			<Column xlg={12} lg={12} md={8} sm={4}>
				<h4 className={`${blockClass}--title`}>{title}</h4>
				{subtitle && (
					<h6 className={`${blockClass}--subtitle`}>{subtitle}</h6>
				)}
				{description && (
					<p className={`${blockClass}--description`}>{description}</p>
				)}
			</Column>
			<Column span={100}>
				{hasFieldset ? (
					<FormGroup
						legendText={fieldsetLegendText}
						className={`${blockClass}--fieldset`}
					>
						<Grid>{children}</Grid>
					</FormGroup>
				) : (
					children
				)}
			</Column>
		</Grid>
		);
	};
	const DocumentEditTearsheet = () => {
		return (
			<EditTearsheet
				cancelButtonText="Cancel"
				className="c4p--tearsheet-edit-multi-form test-class-name"
				description="Specify details for the topic you want to update"
				influencerWidth="narrow"
				label=""
				open={open}
				onClose={() => setOpen(false)}
				submitButtonText="Save"
				title="Edit topic"
				
			>
				<EditTearsheetForm
					description="It will also be used by your producers and consumers as part of the connection information, so make it something easy to recognize."
					fieldsetLegendText="Topic information"
					subtitle="This is the unique name used to recognize your topic"
					title="Topic name"
				>
					<Column
						lg={8}
						md={8}
						sm={8}
						xlg={8}
					>
						<TextInput
							id="tearsheet-multi-form-story-text-input-multi-form-1"
							invalidText="This is a required field"
							labelText="Topic name"
							onBlur={function noRefCheck() { }}
							onChange={function noRefCheck() { }}
							placeholder="Enter topic name"
							value="Topic name here"
						/>
						<TextInput
							id="tearsheet-multi-form-story-text-input-multi-form-1-input-2"
							labelText="Topic description (optional)"
							onChange={function noRefCheck() { }}
							placeholder="Enter topic description"
							value="Topic description here"
						/>
						<TextInput
							id="tearsheet-multi-form-story-text-input-multi-form-1-input-3"
							labelText="Topic version (optional)"
							onChange={function noRefCheck() { }}
							placeholder="Enter topic version"
							value="Topic value here"
						/>
						<Toggle
							className="c4p--tearsheet-edit-multi-form__error--toggle"
							id="simulated-error-toggle"
							labelText="Simulate error"
							onToggle={function noRefCheck() { }}
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
					<Column
						lg={8}
						md={8}
						sm={8}
						xlg={8}
					>
						<TextInput
							id="custom-form-input"
							labelText="Location"
							onChange={function noRefCheck() { }}
							placeholder="Enter location"
							value="Location here"
						/>
					</Column>
				</EditTearsheetForm>
				<EditTearsheetForm
					description="Partitions are distributed across the brokers in order to increase the scalability of your topic. You can also use them to distribute messages across the members of a consumer group."
					fieldsetLegendText="Partition information"
					subtitle="One or more partitions make up a topic. A partition is an ordered list of messages."
					title="Partitions"
				>
					<Column
						lg={3}
						md={8}
						sm={4}
						xlg={3}
					>
						<NumberInput
							helperText="1 partition is sufficient for getting started but, production systems often have more."
							id="carbon-number"
							invalidText="Max partitions is 100, min is 1"
							label="Partitions"
							max={100}
							min={1}
							onChange={function noRefCheck() { }}
							value={1}
						/>
					</Column>
				</EditTearsheetForm>
				<EditTearsheetForm
					description="If your messages are not read by a consumer within this time, they will be missed."
					fieldsetLegendText="Message retention scheduling"
					subtitle="This is how long messages are retained before they are deleted."
					title="Message retention"
				>
					<Column
						lg={8}
						md={8}
						sm={8}
						xlg={8}
					>
						<RadioButtonGroup
							defaultSelected="one-day"
							legendText="Message retention"
							name="radio-button-group"
							onChange={function noRefCheck() { }}
							orientation="vertical"
						>
							<RadioButton
								id="one-day"
								labelText="A day"
								value="one-day"
							/>
							<RadioButton
								id="one-week"
								labelText="A week"
								value="one-week"
							/>
							<RadioButton
								id="one-month"
								labelText="A month"
								value="one-month"
							/>
						</RadioButtonGroup>
					</Column>
				</EditTearsheetForm>
			</EditTearsheet>
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
