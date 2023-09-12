import { create } from "zustand";
import { Collection, Tag } from "../../../../web/src/bindings";

type FilterState = {
	tags: Tag[];
	collections: Collection[];
	dateRange: { start: Date | null; end: Date | null };
	onlyFavorites: boolean;
};

type FilterActions = {
	setTags: (tags: Tag[]) => void;
	setCollections: (collections: Collection[]) => void;
	setDateRange: (dateRange: { start: Date | null; end: Date | null }) => void;
	setOnlyFavorites: (onlyFavorites: boolean) => void;
	reset: () => void;
};

const initialState: FilterState = {
	tags: [],
	collections: [],
	dateRange: { start: null, end: null },
	onlyFavorites: false,
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
	...initialState,
	setTags: (tags) => set({ tags }),
	setCollections: (collections) => set({ collections }),
	setDateRange: (dateRange) => set({ dateRange }),
	setOnlyFavorites: (onlyFavorites) => set({ onlyFavorites }),
	reset: () => {
		set(initialState);
	},
}));
