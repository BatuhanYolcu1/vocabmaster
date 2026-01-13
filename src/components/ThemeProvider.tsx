'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Check localStorage for saved theme preference
        const stored = localStorage.getItem('vocabmaster-theme') as Theme | null;

        if (stored) {
            // Use saved preference if exists
            setThemeState(stored);
        }
        // Otherwise keep default 'light' theme - no system preference check

        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            // Apply theme class to html element
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
            localStorage.setItem('vocabmaster-theme', theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    // Prevent flash - show dark background while mounting
    if (!mounted) {
        return (
            <div style={{
                backgroundColor: '#0b0f17',
                minHeight: '100vh',
                color: '#f1f5f9'
            }}>
                {children}
            </div>
        );
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    // Return default values if used outside ThemeProvider (e.g., not-found page)
    if (!context) {
        return {
            theme: 'dark' as Theme,
            toggleTheme: () => { },
            setTheme: () => { },
        };
    }
    return context;
}
