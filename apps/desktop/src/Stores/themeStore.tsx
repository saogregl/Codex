import { create } from 'zustand';

type ThemeState = {
    theme: 'g10' | 'g100';
    setTheme: (theme: string) => void;
    switchTheme: () => void;
};

const useThemeStore = create<ThemeState>((set) => ({
    theme: (localStorage.getItem('theme') as 'g10' | 'g100') || 'g10',
    setTheme: (theme: "g10" | "g100") => {
        localStorage.setItem('theme', theme);
        set({ theme });
    },
    switchTheme: () => {
        const theme = (localStorage.getItem('theme') as 'g10' | 'g100') || 'g10';
        if (theme === 'g10') {
            localStorage.setItem('theme', 'g100');
            set({ theme: 'g100' });
        } else {
            localStorage.setItem('theme', 'g10');
            set({ theme: 'g10' });
        }
    }
}));

export default useThemeStore;
