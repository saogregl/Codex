import { SearchResult, Tag, TagOnObject } from "../../../../web/src/bindings";
import { useFilterStore } from "../Stores/filterStore";

interface useFiltersProps {
	data: SearchResult[];
}

const useFilters = () => {
	const {
		tags,
		collections,
		dateRange,
		onlyFavorites,
		setTags,
		setCollections,
		setDateRange,
		setOnlyFavorites,
	} = useFilterStore();

	const getFilteredData = ({ data }: useFiltersProps) => {
		// Here you can filter the data based on the current state of the filters.
		// This is a simple demonstration; you'll need to adjust this logic to your needs.
		console.log(tags, collections, dateRange, onlyFavorites);

		let filtered = [...data];

		if (tags.length > 0) {
			tags.map((tag) => {
				filtered = filtered.filter((item) =>
					item.tags.some((itemTag) => itemTag.tag_id === tag.id),
				);
			});
		}

		if (collections.length > 0) {
			filtered = filtered.filter((item) =>
				collections.some(
					(collection) => item.object.collectionId === collection.id,
				),
			);
		}

		if (dateRange.start !== null) {
			filtered = filtered.filter((item) => {
				console.log(item.object.date_created);
				const date = new Date(item.object.date_created);
				return date >= dateRange.start;
			});
		}

		if (dateRange.end !== null) {
			filtered = filtered.filter((item) => {
				const date = new Date(item.object.date_created);
				return date <= dateRange.end;
			});
		}

		if (onlyFavorites === true) {
			filtered = filtered.filter((item) => item.object.favorite === true);
		}

		return filtered;
	};

	return {
		tags,
		collections,
		dateRange,
		onlyFavorites,
		getFilteredData,
		setTags,
		setCollections,
		setDateRange,
		setOnlyFavorites,
	};
};

export default useFilters;
