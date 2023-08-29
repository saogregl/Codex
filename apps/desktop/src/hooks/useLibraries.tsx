import { useState } from "react";
import rspc from "../lib/query";

const useLibraries = () => {

  const {
    data: libraries,
    isLoading: isLoadingLibraries,
    error: errorLibraries,
  } = rspc.useQuery(["library.get_all_libraries"]);


  return {
    libraries,
    isLoadingLibraries,
    errorLibraries
  }
}

export default useLibraries;