/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Datagrid } from "@carbon/ibm-products";
import useLocationTable from "./hooks/useLocationTable";

interface ILocationTableProps {
	collectionId: number;
}

const LocationTable = ({ collectionId }: ILocationTableProps) => {
	const { datagridState } = useLocationTable({ collectionId });

	return (
		<>
			<Datagrid datagridState={datagridState} />
		</>
	);
};

export default LocationTable;
