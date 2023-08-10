import { useState } from "react";
import rspc from "../lib/query";

const useDocuments = () => {

  const [query, setQuery] = useState("teste");

  const {
    data: objects,
    isLoading: isLoadingObjects,
    error: errorObjects,
  } = rspc.useQuery(["library.get_all_objects"]);


  const {
    data: SearchResult,
    isLoading: isLoadingSearchResult,
    error: errorSearchResult,
  } = rspc.useQuery(["search.search", { query }]);

  return {
    SearchResult,
    isLoadingSearchResult,
    errorSearchResult,
    objects,
    isLoadingObjects,
    errorObjects,
    setQuery
  }
}

export default useDocuments;