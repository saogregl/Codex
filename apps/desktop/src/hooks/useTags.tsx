import { useState } from "react";
import rspc from "../lib/query";

const useTags = () => {
	const {
		data: tags,
		isLoading: isLoadingTags,
		error: errorTags,
	} = rspc.useQuery(["tags.get_tags"]);

	const {
		mutateAsync: addTagUnchecked,
		isLoading: isAddingTag,
		error: addTagError,
	} = rspc.useMutation("tags.add_tag_unchecked");

	return {
		tags,
		isLoadingTags,
		errorTags,
		addTagUnchecked,
		isAddingTag,
		addTagError,
	};
};

export default useTags;
