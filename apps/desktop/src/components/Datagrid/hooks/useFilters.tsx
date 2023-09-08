/*
 * Licensed Materials - Property of IBM
 * 5724-Q36
 * (c) Copyright IBM Corp. 2023
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 */

// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore
import {
  Checkbox,
  DatePicker,
  // @ts-ignore

  DatePickerInput,
  Dropdown,
  // @ts-ignore

  FormGroup,
  // @ts-ignore

  NumberInput,
  // @ts-ignore

  RadioButton,
  // @ts-ignore

  RadioButtonGroup,
  // @ts-ignore

  Layer,
} from '@carbon/react';
import {
  INSTANT,
  BATCH,
  DATE,
  CHECKBOX,
  NUMBER,
  RADIO,
  DROPDOWN,
  PANEL,
} from '../constants';
import { getInitialStateFromFilters } from '../utilts';

const useFilters = ({
  updateMethod,
  filters = [],
  setAllFilters,
  variation,
  reactTableFiltersState,
  onCancel = () => {},
}) => {
  /** State */
  const [filtersState, setFiltersState] = useState(
    getInitialStateFromFilters(filters, variation, reactTableFiltersState)
  );

  const [filtersObjectArray, setFiltersObjectArray] = useState(
    reactTableFiltersState
  );

  // When using batch actions we have to store the filters to then apply them later
  const prevFiltersRef = useRef(JSON.stringify(filtersState));
  const lastAppliedFilters = useRef(JSON.stringify(reactTableFiltersState));
  const prevFiltersObjectArrayRef = useRef(JSON.stringify(filtersObjectArray));

  /** Methods */
  // If the user decides to cancel or click outside the flyout, it reverts back to the filters that were
  // there when they opened the flyout
  const revertToPreviousFilters = () => {
    setFiltersState(JSON.parse(prevFiltersRef.current));
    setFiltersObjectArray(JSON.parse(prevFiltersObjectArrayRef.current));
    setAllFilters(JSON.parse(lastAppliedFilters.current));
  };

  const reset = () => {
    // When we reset we want the "initialFilters" to be an empty array
    const resetFiltersArray = [];

    // Get the initial values for the filters
    const initialFiltersState = getInitialStateFromFilters(
      filters,
      variation,
      resetFiltersArray
    );
    const initialFiltersObjectArray = [];

    // Set the state to the initial values
    setFiltersState(initialFiltersState);
    setFiltersObjectArray(initialFiltersObjectArray);
    setAllFilters([]);

    // Update their respective refs so everything is in sync
    prevFiltersRef.current = JSON.stringify(initialFiltersState);
    prevFiltersObjectArrayRef.current = JSON.stringify(
      initialFiltersObjectArray
    );
  };

  const applyFilters = ({ column, value, type }) => {
    // If no end date is selected return because we need the end date to do computations
    if (type === DATE && value.length > 0 && !value[1]) {
      return;
    }

    const filtersObjectArrayCopy = [...filtersObjectArray];
    // // check if the filter already exists in the array
    const filter = filtersObjectArrayCopy.find((item) => item.id === column);

    // // if filter exists in array then update the filter's new value
    if (filter) {
      filter.value = value;
    } else {
      filtersObjectArrayCopy.push({ id: column, value, type });
    }

    // ATTENTION: this is where you would reset or remove individual filters from the filters array
    if (type === CHECKBOX) {
      /**
      When all checkboxes of a group are all unselected the value still exists in the filtersObjectArray
      This checks if all the checkboxes are selected = false and removes it from the array
     */
      const index = filtersObjectArrayCopy.findIndex(
        (filter) => filter.id === column
      );

      // If all the selected state is false remove from array
      const shouldRemoveFromArray = filtersObjectArrayCopy[index].value.every(
        (val) => val.selected === false
      );

      if (shouldRemoveFromArray) {
        filtersObjectArrayCopy.splice(index, 1);
      }
    } else if (type === DATE) {
      if (value.length === 0) {
        /**
        Checks to see if the date value is an empty array, if it is that means the user wants
        to reset the date filter
      */
        const index = filtersObjectArrayCopy.findIndex(
          (filter) => filter.id === column
        );

        // Remove it from the filters array since there is nothing to filter
        filtersObjectArrayCopy.splice(index, 1);
      }
    } else if (type === DROPDOWN || type === RADIO) {
      if (value === 'Any') {
        /**
        Checks to see if the selected value is 'Any', that means the user wants
        to reset specific filter
      */
        const index = filtersObjectArrayCopy.findIndex(
          (filter) => filter.id === column
        );

        // Remove it from the filters array
        filtersObjectArrayCopy.splice(index, 1);
      }
    } else if (type === NUMBER) {
      // If the value is empty remove it from the filtersObjectArray
      if (value === '') {
        // Find the column that uses number and displays an empty string
        const index = filtersObjectArrayCopy.findIndex(
          (filter) => filter.id === column
        );

        // Remove it from the filters array
        filtersObjectArrayCopy.splice(index, 1);
      }
    }

    setFiltersObjectArray(filtersObjectArrayCopy);

    // // Automatically apply the filters if the updateMethod is instant
    if (updateMethod === INSTANT) {
      setAllFilters(filtersObjectArrayCopy);
    }
  };
  /** Render the individual filter component */
  const renderFilter = ({ type, column, props: components }) => {
    let filter;
    const isPanel = variation === PANEL;

    if (!type) {
      return console.error(
        `type: ${type}; does not exist as a type of filter.`
      );
    }

    switch (type) {
      case DATE:
        filter = (
          <DatePicker
            {...components.DatePicker}
            onChange={(value) => {
              setFiltersState({ ...filtersState, [column]: { value, type } });
              applyFilters({ column, value, type });
              components.DatePicker.onChange?.(value);
            }}
            value={filtersState[column].value}
            datePickerType="range"
          >
            <DatePickerInput
              placeholder="mm/dd/yyyy"
              labelText="Start date"
              {...components.DatePickerInput.start}
            />
            <DatePickerInput
              placeholder="mm/dd/yyyy"
              labelText="End date"
              {...components.DatePickerInput.end}
            />
          </DatePicker>
        );
        break;
      case NUMBER:
        filter = (
          <NumberInput
            step={1}
            allowEmpty
            hideSteppers
            {...components.NumberInput}
            onChange={(event) => {
              setFiltersState({
                ...filtersState,
                [column]: {
                  value: event.target.value,
                  type,
                },
              });
              applyFilters({ column, value: event.target.value, type });
              components.NumberInput.onChange?.(event);
            }}
            value={filtersState[column].value}
          />
        );
        break;
      case CHECKBOX:
        filter = (
          <FormGroup {...components.FormGroup}>
            {filtersState[column].value.map((option) => (
              <Checkbox
                key={option.labelText}
                {...option}
                onChange={(_, { checked: isSelected }) => {
                  const checkboxCopy = filtersState[column].value;
                  const foundCheckbox = checkboxCopy.find(
                    (checkbox) => checkbox.value === option.value
                  );
                  foundCheckbox.selected = isSelected;
                  setFiltersState({
                    ...filtersState,
                    [column]: {
                      value: checkboxCopy,
                      type,
                    },
                  });
                  applyFilters({
                    column,
                    value: [...filtersState[column].value],
                    type,
                  });
                  option.onChange?.(isSelected);
                }}
                checked={option.selected}
              />
            ))}
          </FormGroup>
        );
        break;
      case RADIO:
        filter = (
          <FormGroup {...components.FormGroup}>
            <RadioButtonGroup
              {...components.RadioButtonGroup}
              valueSelected={
                filtersState[column]?.value === ''
                  ? 'Any'
                  : filtersState[column]?.value
              }
              onChange={(selected) => {
                setFiltersState({
                  ...filtersState,
                  [column]: {
                    value: selected,
                    type,
                  },
                });
                applyFilters({
                  column,
                  value: selected,
                  type,
                });
                components.RadioButtonGroup.onChange?.(selected);
              }}
            >
              <RadioButton id="any" labelText="Any" value="Any" />
              {components.RadioButton.map((radio) => (
                <RadioButton
                  key={radio.id ?? radio.labelText ?? radio.value}
                  {...radio}
                />
              ))}
            </RadioButtonGroup>
          </FormGroup>
        );
        break;
      case DROPDOWN:
        filter = (
          <Dropdown
            {...components.Dropdown}
            selectedItem={
              filtersState[column]?.value === ''
                ? 'Any'
                : filtersState[column]?.value
            }
            items={['Any', ...components.Dropdown.items]}
            onChange={({ selectedItem }) => {
              setFiltersState({
                ...filtersState,
                [column]: {
                  value: selectedItem,
                  type,
                },
              });
              applyFilters({
                column,
                value: selectedItem,
                type,
              });
              components.Dropdown.onChange?.(selectedItem);
            }}
          />
        );
        break;
    }

    if (isPanel) {
      return <Layer key={column}>{filter}</Layer>;
    }

    return <React.Fragment key={column}>{filter}</React.Fragment>;
  };

  const cancel = () => {
    // Reverting to previous filters only applies when using batch actions
    if (updateMethod === BATCH) {
      revertToPreviousFilters();
      onCancel();
    }
  };

  /** The purpose of this function is to sync any changes in react-tables state.filters array and reflect
      those new filter changes in the panel/flyout state. The external change is triggered if setAllFilters is called outside of the Datagrid */
  useEffect(
    function updateStateAndFiltersToReflectExternalFilterChanges() {
      const newFiltersState = getInitialStateFromFilters(
        filters,
        variation,
        reactTableFiltersState
      );
      setFiltersState(newFiltersState);
      prevFiltersRef.current = JSON.stringify(newFiltersState);
      prevFiltersObjectArrayRef.current = JSON.stringify(
        reactTableFiltersState
      );

      setFiltersObjectArray(reactTableFiltersState);
    },
    [filters, reactTableFiltersState, variation]
  );

  return {
    filtersState,
    setFiltersState,
    prevFiltersObjectArrayRef,
    prevFiltersRef,
    revertToPreviousFilters,
    reset,
    renderFilter,
    filtersObjectArray,
    lastAppliedFilters,
    cancel,
  };
};

export default useFilters;