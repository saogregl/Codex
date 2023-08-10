import {
  useDatagrid,
} from "@carbon/ibm-products";
import { Datagrid } from "@carbon/ibm-products";
import { useMemo, useState } from "react";
import { DatagridPagination } from "./DatagridPagination";
import useDocuments from "../../hooks/useDocuments";

const DataGridComponent = () => {


  const { SearchResult, setQuery, objects } = useDocuments();

  // type Object = {
  //   id: number;
  //   uuid: string;
  //   obj_name: string | null;
  //   kind: number | null;
  //   hidden: boolean | null;
  //   favorite: boolean | null;
  //   important: boolean | null;
  //   note: string | null;
  //   date_created: string | null;
  //   date_modified: string | null;
  //   path: string | null;
  //   extension: string | null;
  //   relative_path: string | null;
  //   indexed: boolean | null;
  //   libraryId: string;
  //   locationId: string
  // }


  const headers = [
    {
      Header: "ID",
      accessor: (row, i) => i,
      sticky: "left",
      id: "rowIndex", // id is required when accessor is a function.
    },
    {
      Header: "Nome do documento",
      accessor: "obj_name",
      Cell: ({ cell: { value } }) => (
        <h6 className="custom-cell-wrapper">{value}</h6>
      ),
        width: 300,
    },
    {
      Header: "Data de criação",
      accessor: "date_created",
    },
    {
      Header: "Caminho",
      accessor: "path",
      width: 500,
    },
    {
      Header: "Extensão",
      accessor: "extension",
    },
    {
      Header: "libraryId",
      accessor: "libraryId",
    },
  ];

  const columns = useMemo(() => [...headers], []);
  const [areAllSelected, setAreAllSelected] = useState(false);
  const datagridState = useDatagrid(
    {
      columns,
      data: objects? objects : [],
      useDenseHeader: false,
      emptyStateTitle: "Nenhum resultado encontrado",
      emptyStateDescription:
        "Não há dados para exibir. Tente alterar suas opções de filtro.",
      gridTitle: 'Data table title',
      gridDescription: 'Additional information if needed',
      initialState: {
        pageSize: 10,
        pageSizes: [5, 10, 25, 50],
      },
      DatagridPagination,
    },
  );

  // Check if we have a datagridstate and if it has a tableId
  return (
    <div className="sipe--datagrid-container">
      <Datagrid datagridState={datagridState} />
    </div>);
};
export default DataGridComponent;
