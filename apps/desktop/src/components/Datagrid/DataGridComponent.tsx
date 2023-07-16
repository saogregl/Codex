import {
  useDatagrid,
  useNestedRows,
  useSelectRows,
  useSelectAllWithToggle,
  useFiltering
} from "@carbon/ibm-products";
import { Datagrid } from "@carbon/ibm-products";
import { useMemo, useState } from "react";
import { data as sampleData } from "./sampleData";
import { DatagridPagination } from "./DatagridPagination";

const DataGridComponent = () => {
  const headers = [
    {
      Header: "ID",
      accessor: (row, i) => i,
      sticky: "left",
      id: "rowIndex", // id is required when accessor is a function.
    },
    {
      Header: "Título",
      accessor: "firstName",
      Cell: ({ cell: { value } }) => {
        return <h6>{value}</h6>;
      },
    },
    {
      Header: "Material",
      accessor: "material",
    },
    {
      Header: "Versão",
      accessor: "version",
    },
    {
      Header: "Descrição",
      accessor: "description",
      filter: "string",
    },
    {
      Header: "Status",
      accessor: "status",
    },
  ];

  const [data] = useState(sampleData);
  const columns = useMemo(() => [...headers], []);
  const [areAllSelected, setAreAllSelected] = useState(false);
  const datagridState = useDatagrid(
    {
      columns,
      data,
      useDenseHeader: false,
      emptyStateTitle: "Nenhum resultado encontrado",
      emptyStateDescription:
        "Não há dados para exibir. Tente alterar suas opções de filtro.",
      filterProps: {
        variation: "flyout",
        updateMethod: "lote",
        primaryActionLabel: "Aplicar",
        secondaryActionLabel: "Cancelar",
        flyoutIconDescription: "Abrir Filtro",
      },
      initialState: {
        pageSize: 5,
        pageSizes: [5, 10, 25, 50],
      },
      DatagridPagination,

      // selectAllToggle: {
      //   labels: {
      //     allRows: "Select all",
      //   },
      //   onSelectAllRows: setAreAllSelected,
      // },
    },
    useNestedRows,
    useSelectRows,
    useSelectAllWithToggle,
  );

  // Check if we have a datagridstate and if it has a tableId
  return (
    <div className="sipe--datagrid-container">
      <Datagrid datagridState={datagridState} />
    </div>);
};
export default DataGridComponent;
