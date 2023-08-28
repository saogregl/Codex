import { useState } from "react";
import rspc from "../lib/query";

const useDocuments = () => {


  const {
    data: objects,
    isLoading: isLoadingObjects,
    error: errorObjects,
  } = rspc.useQuery(["library.get_all_objects"]);

  const {
    data: libraries,
    isLoading: isLoadingLibraries,
    error: errorLibraries,
  } = rspc.useQuery(["library.get_all_libraries"]);


  return {
    objects,
    libraries,
    isLoadingObjects,
    errorObjects,
  }
}

export default useDocuments;