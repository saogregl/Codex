/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { createContext, useState } from 'react';

export const FilterContext = createContext(
  {} as {
    filterValues: { key: string; value: string }[];
    searchString: string;
    setFilterValues: (values: { key: string; value: string }[]) => void;
    onSearchStringChange: (value: string) => void;
  }
);


const prepareFiltersForTags = (filters) => {
  const tags = [];

  filters.forEach(({ id, type, value }) => {
    if (type === "dropdown" || type === "radio" || type === "number") {
      tags.push({ key: id, value });
    } else if (type === "date") {
      const [startDate, endDate] = value;
      tags.push({
        key: id,
        value: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      });
    } else if (type === "checkbox") {
      value.forEach((checkbox) => {
        if (checkbox.selected) {
          tags.push({ key: id, value: checkbox.value });
        }
      });
    }
  });

  return tags;
};

export const FilterProvider = ({ children, filters}) => {
  const [filterState, setFilterState] = useState(filters);
  const filterValues = prepareFiltersForTags(filters);
  const [searchString, setSearchString] = useState("");

  
  const onSearchStringChange = (value) => {
    setSearchString(value);
  };

  
  const value = { filterValues, searchString, setFilterValues: setFilterState, onSearchStringChange };
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};
