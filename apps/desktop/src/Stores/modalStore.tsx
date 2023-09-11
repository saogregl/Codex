import { create } from "zustand";

type ModalState = {
	currentState: number;
	setCurrentState: (currentState: number) => void;
};

const useModalStore = create<ModalState>((set) => ({
	currentState: parseInt(localStorage.getItem("currentFormState")) || 0,
	setCurrentState: (currentState) => {
		localStorage.setItem("currentFormState", currentState.toString());
		set({ currentState });
	},
}));

export default useModalStore;
