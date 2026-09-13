import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { ThemeColors, ThemeName, themes } from '@/constants/store-theme';

type ThemeContextData = {
    name: ThemeName;
    colors: ThemeColors;
    toggle: () => void;
    setTheme: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextData | null>(null);
const STORAGE_KEY = 'loja-fatec:theme';

function readInitial(): ThemeName {
    if (Platform.OS === 'web') {
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') {
                return stored;
            }
        } catch {
            // ignora ambientes sem localStorage
        }
    }
    // Padrão é escuro: menos fadiga visual e as fotos de produto se destacam.
    return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [name, setName] = useState<ThemeName>(readInitial);

    useEffect(() => {
        if (Platform.OS === 'web') {
            try {
                window.localStorage.setItem(STORAGE_KEY, name);
            } catch {
                // ignora
            }
        }
    }, [name]);

    const value = useMemo<ThemeContextData>(
        () => ({
            name,
            colors: themes[name],
            toggle: () => setName((current) => (current === 'light' ? 'dark' : 'light')),
            setTheme: setName,
        }),
        [name],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }

    return context;
}
