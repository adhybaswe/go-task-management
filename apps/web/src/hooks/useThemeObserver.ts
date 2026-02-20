import { useEffect } from 'react';
import { useThemeStore } from './useTheme';

export function useThemeObserver() {
    const { isDarkMode } = useThemeStore();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);
}
