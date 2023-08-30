import { useState } from "react";
import rspc from "../lib/query";

const useTags = () => {

  const {
    data: tags,
    isLoading: isLoadingTags,
    error: errorTags,
  } = rspc.useQuery(["tags.get_tags"]);


  return {
    tags,
    isLoadingTags,
    errorTags
  }
}

export default useTags;