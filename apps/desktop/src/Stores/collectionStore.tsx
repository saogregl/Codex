import { create } from 'zustand';
import { Collection } from '../../../../web/src/bindings';

type CollectionStore = {
  collections: Collection[];
};

const useQueryParamStore = create<CollectionStore>((set) => ({
    collections: [],
    
}));

export default useQueryParamStore;
