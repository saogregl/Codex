import React from 'react';
import {   // @ts-ignore
  Button, DataTable
} from '@carbon/react';
import { Download, Filter, Add, Restart } from '@carbon/react/icons';

const blockClass = `c4p--datagrid`;
export const DatagridActions = (datagridState) => {
  const {
    selectedFlatRows,
    setGlobalFilter = () => { },
    CustomizeColumnsButton = false,
    RowSizeDropdown,
    rowSizeDropdownProps,
    useDenseHeader,
  } = datagridState;


  const downloadCsv = () => {
    console.log('Downloading...');
  };
  const { TableToolbarContent, TableToolbarSearch } = DataTable;

  const refreshColumns = () => {
    console.log('refreshing...');
  };
  const leftPanelClick = () => {
    console.log('open/close left panel...');
  };
  const searchForAColumn = 'Search';
  const isNothingSelected = selectedFlatRows.length === 0;
  return (
    isNothingSelected &&
    (useDenseHeader && useDenseHeader ? (
      <TableToolbarContent size="sm">
        <div>
          <Button
            kind="ghost"
            hasIconOnly
            tooltipPosition="bottom"
            renderIcon={Download}
            iconDescription={'Download CSV'}
            onClick={downloadCsv}
          />
        </div>
        <div>
          <Button
            kind="ghost"
            hasIconOnly
            tooltipPosition="bottom"
            renderIcon={Filter}
            iconDescription={'Left panel'}
            onClick={leftPanelClick}
          />
        </div>
        <RowSizeDropdown {...rowSizeDropdownProps} />
        <div className={`${blockClass}__toolbar-divider`}>
          <Button kind="ghost" renderIcon={Add} iconDescription={'Action'}>
            Ghost button
          </Button>
        </div>

        {CustomizeColumnsButton && (
          <div>
            <CustomizeColumnsButton />
          </div>
        )}
      </TableToolbarContent>
    ) : (
      <>
        <Button
          kind="ghost"
          hasIconOnly
          tooltipPosition="bottom"
          renderIcon={Filter}
          iconDescription={'Left panel'}
          onClick={leftPanelClick}
        />
        <TableToolbarContent>
          <TableToolbarSearch
            size="xl"
            id="columnSearch"
            persistent
            placeHolderText={searchForAColumn}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <RowSizeDropdown {...rowSizeDropdownProps} />
          <div>
            <Button
              kind="ghost"
              hasIconOnly
              tooltipPosition="bottom"
              renderIcon={Restart}
              iconDescription={'Refresh'}
              onClick={refreshColumns}
            />
          </div>
          <div>
            <Button
              kind="ghost"
              hasIconOnly
              tooltipPosition="bottom"
              renderIcon={Download}
              iconDescription={'Download CSV'}
              onClick={downloadCsv}
            />
          </div>
          {CustomizeColumnsButton && (
            <div>
              <CustomizeColumnsButton />
            </div>
          )}
        </TableToolbarContent>
      </>
    ))
  );
};

