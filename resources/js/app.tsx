import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { AppearanceProvider } from './hooks/use-appearance';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createCustomTheme } from './lib/theme';
import { ThemeProvider } from './hooks/use-theme';
import React from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAppearance } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function ThemedApp({ App, props }: any) {
    const { appearance } = useAppearance();
    const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const mode: 'light' | 'dark' = appearance === 'system' ? (prefersDark ? 'dark' : 'light') : appearance;
    const theme = createCustomTheme(mode);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <App {...props} />
        </MuiThemeProvider>
    );
}

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <AppearanceProvider>
                <ThemeProvider>
                    <ThemedApp App={App} props={props} />
                </ThemeProvider>
            </AppearanceProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
