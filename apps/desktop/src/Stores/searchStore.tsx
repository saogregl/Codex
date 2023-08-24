import { create } from 'zustand';

type QueryParamState = {
  persistentQuery: string;
  setPersistentQuery: (persistentQuery: string) => void;
};

const useQueryParamStore = create<QueryParamState>((set) => ({
  persistentQuery: localStorage.getItem('persistentQuery') || '',
  setPersistentQuery: (persistentQuery) => {
    localStorage.setItem('persistentQuery', persistentQuery);
    set({ persistentQuery });
  },
}));

export default useQueryParamStore;
