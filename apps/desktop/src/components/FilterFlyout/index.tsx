// @ts-nocheck
import { settings } from "../../constants/settings";
import { Filter } from "@carbon/react/icons";
import classnames from "classnames";
import { useCallback, useRef, useState } from "react";
import {
	Button,
	Checkbox,
	DatePicker,
	DatePickerInput,
	Dropdown,
	FormGroup,
	NumberInput,
	RadioButton,
	RadioButtonGroup,
} from "@carbon/react";
import { useClickOutside } from "../../hooks/useClickOutside";

export enum FilterType {
	DATE = "date",
	NUMBER = "number",
	TEXT = "text",
	DROPDOWN = "dropdown",
	CHECKBOX = "checkbox",
	RADIO = "radio",
}

interface Filter {
	filterType: FilterType;
	FieldToFilter: string;
	filterOptions?: any[];
}

interface Props {
	flyoutIconDescription: string;
	title: string;
	filters?: Filter[];
	onFlyoutOpen: () => void;
	onFlyoutClose: () => void;
	primaryActionLabel: string;
	secondaryActionLabel: string;
	onApply: () => void;
	onCancel: () => void;
	onClear: () => void;
}

const componentClass = `${settings.sipePrefix}-filter-flyout`;

//Deconstructing the props
const FilterFlyout = (props: Props) => {
	const {
		flyoutIconDescription,
		title,
		filters = [
			{
				filterType: FilterType.DATE,
				FieldToFilter: "date",
				filterOptions: {},
			},
			{
				filterType: FilterType.NUMBER,
				FieldToFilter: "number",
				filterOptions: {},
			},
			{
				filterType: FilterType.TEXT,
				FieldToFilter: "text",
				filterOptions: {},
			},
			{
				filterType: FilterType.DROPDOWN,
				FieldToFilter: "dropdown",
				filterOptions: {},
			},
			{
				filterType: FilterType.CHECKBOX,
				FieldToFilter: "checkbox",
				filterOptions: {
					FormGroup: {
						legendText: "Password strength",
					},
					Checkbox: [
						{
							id: "normal",
							labelText: "Normal",
							value: "normal",
						},
						{
							id: "minor-warning",
							labelText: "Minor warning",
							value: "minor-warning",
						},
						{
							id: "critical",
							labelText: "Critical",
							value: "critical",
						},
					],
				},
			},
			{
				filterType: FilterType.RADIO,
				FieldToFilter: "radio",
				filterOptions: {
					FormGroup: {
						legendText: "Role",
					},
					RadioButtonGroup: {
						orientation: "vertical",
						legend: "Role legend",
						name: "role-radio-button-group",
					},
					RadioButton: [
						{
							id: "developer",
							labelText: "Developer",
							value: "developer",
						},
						{
							id: "designer",
							labelText: "Designer",
							value: "designer",
						},
						{
							id: "researcher",
							labelText: "Researcher",
							value: "researcher",
						},
					],
				},
			},
		],
		onFlyoutOpen,
		onFlyoutClose,
		primaryActionLabel,
		secondaryActionLabel,
		onApply,
		onCancel,
		onClear,
	} = props;

	const [open, setOpen] = useState(false);
	const [filtersState, setFiltersState] = useState(filters);
	const [filtersObjectArray, setFiltersObjectArray] = useState([]);

	/** Refs */
	const filterFlyoutRef = useRef(null);

	const openFlyout = () => {
		setOpen(true);
		onFlyoutOpen();
	};
	const closeFlyout = () => {
		setOpen(false);
		onFlyoutClose();
	};

	const applyFilters = useCallback(({ column, value, type }) => {}, []);
	const showActionSet = true;

	const cancel = () => {
		// Reverting to previous filters only applies when using batch actions
		closeFlyout();
	};

	useClickOutside(filterFlyoutRef, (target) => {
		if (!open) {
			return;
		}
		closeFlyout();
	});

	const renderFilter = useCallback(
		({
			filterType: type,
			FieldToFilter: column,
			filterOptions: options,
		}: Filter) => {
			if (type === FilterType.DATE) {
				return (
					<DatePicker
						key={column}
						//{...components.DatePicker}
						onChange={(value) => {
							setFiltersState({ ...filtersState, [column]: value });
							applyFilters({ column, value, type });
							//components.DatePicker.onChange?.(value);
						}}
						value={filtersState[column]}
						datePickerType="range"
					>
						<DatePickerInput
							id="teste"
							placeholder="mm/dd/yyyy"
							labelText="Start date"
						/>
						<DatePickerInput
							id="teste"
							placeholder="mm/dd/yyyy"
							labelText="End date"
						/>
					</DatePicker>
				);
			} else if (type === "number") {
				return (
					<NumberInput
						key={column}
						step={1}
						allowEmpty
						hideSteppers
						min={0}
						onChange={(event) => {
							setFiltersState({
								...filtersState,
								[column]: event.target.value,
							});
							applyFilters({ column, value: event.target.value, type });
							//components.NumberInput.onChange?.(event);
						}}
						value={filtersState[column]}
					/>
				);
			} else if (type === "checkbox") {
				return (
					<FormGroup {...props.FormGroup}>
						{filtersState
							.filter((a) => {
								return a.filterType === column;
							})[0]
							.filterOptions.Checkbox.map((option) => (
								<Checkbox
									key={option.labelText}
									{...option}
									onChange={(isSelected) => {
										const checkboxCopy = filtersState[column];
										const foundCheckbox = checkboxCopy.find(
											(checkbox) => checkbox.value === option.value,
										);
										foundCheckbox.selected = isSelected;
										setFiltersState({
											...filtersState,
											[column]: checkboxCopy,
										});
										applyFilters({
											column,
											value: [...filtersState[column]],
											type,
										});
										option.onChange?.(isSelected);
									}}
									checked={option.selected}
								/>
							))}
					</FormGroup>
				);
			} else if (type === "radio") {
				return (
					<FormGroup>
						<RadioButtonGroup
							valueSelected={filtersState[column]}
							onChange={(selected) => {
								setFiltersState({ ...filtersState, [column]: selected });
								applyFilters({
									column,
									value: selected,
									type,
								});
							}}
						>
							{options.RadioButton.map((radio) => (
								<RadioButton
									key={radio.id ?? radio.labelText ?? radio.value}
									{...radio}
								/>
							))}
						</RadioButtonGroup>
					</FormGroup>
				);
			} else if (type === "dropdown") {
				return "dropdown";
			}
		},
		[filtersState, applyFilters, setFiltersState],
	);

	const renderFilters = useCallback(
		() => filters.map(renderFilter),
		[filters, renderFilter],
	);

	const renderActionSet = () => {
		return (
			showActionSet && (
				<div className={`${componentClass}__action-set`}>
					<Button
						kind="secondary"
						onClick={onCancel}
						className={`${componentClass}__action-set__button`}
					>
						{secondaryActionLabel}
					</Button>
					<Button
						kind="primary"
						onClick={onApply}
						className={`${componentClass}__action-set__button`}
					>
						{primaryActionLabel}
					</Button>
				</div>
			)
		);
	};

	return (
		<div ref={filterFlyoutRef} className={`${componentClass}__container`}>
			<Button
				kind="ghost"
				hasIconOnly
				tooltipPosition="bottom"
				renderIcon={Filter}
				iconDescription={flyoutIconDescription}
				onClick={open ? closeFlyout : openFlyout}
				className={classnames(`${componentClass}__trigger`, {
					[`${componentClass}__trigger--open`]: open,
				})}
			/>
			<div
				className={classnames(componentClass, {
					[`${componentClass}--open`]: open,
					[`${componentClass}--batch`]: showActionSet,
					[`${componentClass}--instant`]: !showActionSet,
				})}
			>
				<div className={`${componentClass}__inner-container`}>
					<span className={`${componentClass}__title`}>{title}</span>
					<div className={`${componentClass}__filters`}>{renderFilters()}</div>
				</div>
				{renderActionSet()}
			</div>
		</div>
	);
};

export default FilterFlyout;
