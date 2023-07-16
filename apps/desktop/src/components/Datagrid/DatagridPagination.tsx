/**
 * Copyright IBM Corp. 2022, 2022
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
  // @ts-ignore

import { Pagination } from "@carbon/react";

export const DatagridPagination = ({ state, setPageSize, gotoPage, rows }) => {
  const updatePagination = ({ page, pageSize }) => {
    setPageSize(pageSize);
    gotoPage(page - 1); // Carbon is non-zero-based
  };

  return (
    <Pagination
      backwardText="Pagina Anterior"
      forwardText="Proxima Pagina"
      itemRangeText={(min, max, total) => `${min}-${max} de ${total} itens`}
      itemsPerPageText="Itens por pagina"
      itemText={(min, max) => `${min}-${max} de ${rows.length} itens`}
      pageNumberText="Numero da pagina"
      pageRangeText={(current, total) => `${current} de ${total} paginas`}
      page={state.pageIndex + 1} // react-table is zero-based
      pageSize={state.pageSize}
      pageSizes={state.pageSizes || [10, 20, 30, 40, 50]}
      totalItems={rows.length}
      onChange={updatePagination}
    />
  );
};
