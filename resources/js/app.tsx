import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme, AppearanceProvider, useAppearance } from './hooks/use-appearance';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import React, { useMemo } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function ThemedApp({ App, props }: any) {
    const { appearance } = useAppearance();
    const [mode, setMode] = React.useState(() => {
        if (appearance === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return appearance;
    });

    React.useEffect(() => {
        if (appearance === 'system') {
            setMode(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        } else {
            setMode(appearance);
        }
    }, [appearance]);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary: { main: '#1976d2' },
                    secondary: { main: '#9c27b0' },
                    background: { default: '#f7f9fb', paper: '#fff' },
                }
                : {
                    primary: { main: '#90caf9' },
                    secondary: { main: '#ce93d8' },
                    background: { default: '#181a1b', paper: '#23272f' },
                }),
        },
        shape: { borderRadius: 12 },
        typography: {
            fontFamily: [
                'Instrument Sans',
                'ui-sans-serif',
                'system-ui',
                'sans-serif',
                'Apple Color Emoji',
                'Segoe UI Emoji',
                'Segoe UI Symbol',
                'Noto Color Emoji',
            ].join(','),
            h1: { fontWeight: 700 },
            h2: { fontWeight: 700 },
            h3: { fontWeight: 700 },
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 700 },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    },
                },
            },
        },
    }), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App {...props} />
        </ThemeProvider>
    );
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <AppearanceProvider>
                <ThemedApp App={App} props={props} />
            </AppearanceProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
