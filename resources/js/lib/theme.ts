import { type Theme, type ThemeOptions } from '@mui/material/styles';
import createTheme from '@mui/material/styles/createTheme';

export const createCustomTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
    const isLight = mode === 'light';

    const palette: ThemeOptions['palette'] = {
        mode,
        primary: { main: '#2563eb' },
        secondary: { main: '#7c3aed' },
        success: { main: '#16a34a' },
        warning: { main: '#f59e0b' },
        error: { main: '#dc2626' },
        info: { main: '#0284c7' },
        divider: isLight ? '#e2e8f0' : '#334155',
        background: {
            default: isLight ? '#f8fafc' : '#0f172a',
            paper: isLight ? '#ffffff' : '#1e293b',
        },
        text: {
            primary: isLight ? '#0f172a' : '#f1f5f9',
            secondary: isLight ? '#475569' : '#94a3b8',
        },
    };

    const typography: ThemeOptions['typography'] = {
        fontFamily: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'].join(','),
        h1: { fontWeight: 800, fontSize: '2.5rem', lineHeight: 1.2 },
        h2: { fontWeight: 800, fontSize: '2rem', lineHeight: 1.25 },
        h3: { fontWeight: 700, fontSize: '1.75rem', lineHeight: 1.3 },
        h4: { fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.35 },
        h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
        h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.45 },
        button: { textTransform: 'none', fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
    };

    return createTheme({
        palette,
        typography,
        shape: { borderRadius: 12 },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: palette.background?.default,
                        color: palette.text?.primary,
                    },
                },
            },
            MuiAppBar: {
                defaultProps: { elevation: 1, color: 'default' },
                styleOverrides: { root: { borderRadius: 0 } },
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        fontWeight: 700,
                        paddingInline: 16,
                        paddingBlock: 10,
                    },
                },
            },
            MuiPaper: {
                defaultProps: { elevation: 1 },
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        border: `1px solid ${palette.divider}`,
                    },
                },
            },
            MuiCard: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: {
                        borderRadius: 14,
                        border: `1px solid ${palette.divider}`,
                        backgroundImage: 'none',
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: { borderRadius: 10 },
                    notchedOutline: { borderColor: palette.divider },
                },
            },
            MuiTextField: {
                defaultProps: { size: 'medium' },
            },
            MuiDialog: {
                styleOverrides: { paper: { borderRadius: 16 } },
            },
            MuiChip: {
                styleOverrides: { root: { fontWeight: 600 } },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        '&.Mui-selected': {
                            backgroundColor: isLight ? '#e0e7ff' : '#1e3a8a',
                            color: isLight ? '#1d4ed8' : '#93c5fd',
                        },
                    },
                },
            },
            // MUI X DataGrid theming
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        border: `1px solid ${palette.divider}`,
                        borderRadius: 12,
                    },
                    columnHeaders: {
                        backgroundColor: isLight ? '#f1f5f9' : '#0b1220',
                    },
                    row: {
                        '&:hover': {
                            backgroundColor: isLight ? '#f8fafc' : '#0b1220',
                        },
                    },
                },
            },
        },
    });
};