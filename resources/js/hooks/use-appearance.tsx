import { createContext, useContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

interface AppearanceContextType {
    appearance: Appearance;
    setAppearance: (value: Appearance) => void;
    toggleAppearance: () => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children }: { children: ReactNode }) {
    const [appearance, setAppearanceState] = useState<Appearance>('system');

    // Load persisted preference
    useEffect(() => {
        try {
            const saved = window.localStorage.getItem('appearance') as Appearance | null;
            if (saved === 'light' || saved === 'dark' || saved === 'system') {
                setAppearanceState(saved);
            }
        } catch { }
    }, []);

    const setAppearance = useCallback((value: Appearance) => {
        setAppearanceState(value);
        try {
            window.localStorage.setItem('appearance', value);
        } catch { }
    }, []);

    const toggleAppearance = useCallback(() => {
        setAppearanceState((prev) => {
            const next: Appearance = prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system';
            try {
                window.localStorage.setItem('appearance', next);
            } catch { }
            return next;
        });
    }, []);

    const value = useMemo<AppearanceContextType>(() => ({ appearance, setAppearance, toggleAppearance }), [appearance, setAppearance, toggleAppearance]);

    return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
    const ctx = useContext(AppearanceContext);
    if (!ctx) throw new Error('useAppearance must be used within an AppearanceProvider');
    return ctx;
}
