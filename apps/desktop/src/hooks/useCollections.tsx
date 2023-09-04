import rspc from "../lib/query";

const useCollections = () => {
    
	const {
		data: collections,
		isLoading: isLoadingcollections,
		error: errorCollections,
	} = rspc.useQuery(["collections.get_all_collections"]);

	return {
		collections,
		isLoadingcollections,
		errorCollections,
	};
};

export default useCollections;
