/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { createContext, useState } from 'react';
import { DATE, DROPDOWN, NUMBER, RADIO, CHECKBOX } from '../components/Datagrid/constants';




type EventType = string;
type Callback = (data?: any) => void;
type FilterType = 'dropdown' | 'radio' | 'number' | 'date' | 'checkbox';
type CheckboxValue = { selected: boolean; value: string };

type Filter = {
  id: string;
  type: FilterType;
  value: any[] | CheckboxValue[] | [Date, Date] | string;
};

interface EventEmitterType {
  events: Record<EventType, Callback[]>;
  dispatch: (event: EventType, data?: any) => void;
  subscribe: (event: EventType, callback: Callback) => void;
}



const EventEmitter: EventEmitterType = {
  events: {},
  dispatch: function (event, data) {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach((callback) => callback(data));
  },
  subscribe: function (event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    } else {
      this.events[event].push(callback);
    }
  },
};

const prepareFiltersForTags = (filters: Filter[]) => {
  const tags = [];

  filters.forEach(({ id, type, value }) => {
    if (type === DROPDOWN || type === RADIO || type === NUMBER) {
      tags.push({ key: id, value });
    } else if (type === DATE) {
      const [startDate, endDate] = value as [Date, Date];
      tags.push({
        key: id,
        value: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      });
    } else if (type === CHECKBOX) {
      (value as CheckboxValue[]).forEach((checkbox) => {
        if (checkbox.selected) {
          tags.push({ key: id, value: checkbox.value });
        }
      });
    }
  });

  return tags;
};
interface FilterContextType {
  filterTags: { key: string; value: string }[];
  EventEmitter: EventEmitterType;
  panelOpen: boolean;
  setPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}


const defaultValue: FilterContextType = {
  filterTags: [],
  EventEmitter,
  panelOpen: false,
  setPanelOpen: () => {}, // No-op function as default
};
export const FilterContext = createContext<FilterContextType>(defaultValue);


interface FilterProviderProps {
  children: React.ReactNode;
  filters: Filter[];
}

export const FilterProvider: React.FC<FilterProviderProps> = ({ children, filters }) => {
  const filterTags = prepareFiltersForTags(filters);
  const [panelOpen, setPanelOpen] = useState(false);
  console.log(panelOpen)

  const value = { filterTags, EventEmitter, panelOpen, setPanelOpen };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

