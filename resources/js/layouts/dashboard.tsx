import React from 'react';
import { type SharedData } from '@/types';
import { usePage, Link, useForm, router } from '@inertiajs/react';
import { Box, Container, Drawer, List, ListItemText, ListItemButton, Avatar, Divider, Typography, IconButton, Snackbar, Alert, Tooltip, AppBar, Toolbar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import { useMemo, FC, ReactNode, FormEvent } from 'react';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

import MenuIcon from '@mui/icons-material/Menu';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// UserInfo subcomponent
const UserInfo: FC<{ name: string; avatar?: string; position?: string; department?: string; initials: string; dense?: boolean; showAvatar?: boolean }> = ({
    name,
    avatar,
    position,
    department,
    initials,
    dense = false,
    showAvatar = true,
}) => {
    return (
        <Box p={dense ? 2 : 3} display="flex" flexDirection="column" alignItems={showAvatar ? 'center' : 'flex-start'} borderBottom={1} borderColor="divider">
            {showAvatar && (
                <Avatar sx={{ width: dense ? 40 : 56, height: dense ? 40 : 56, mb: 1 }} src={avatar || undefined}>
                    {initials}
                </Avatar>
            )}
            <Typography variant={dense ? 'subtitle1' : 'h6'} fontWeight={700} textAlign={showAvatar ? 'center' : 'left'}>
                {name}
            </Typography>
            {dense ? (
                <>
                    {position && (
                        <Typography variant="caption" color="text.secondary" textAlign={showAvatar ? 'center' : 'left'}>
                            {String(position)}
                        </Typography>
                    )}
                    {department && (
                        <Typography variant="caption" color="text.secondary" textAlign={showAvatar ? 'center' : 'left'}>
                            {String(department)}
                        </Typography>
                    )}
                </>
            ) : (
                <>
                    <Typography variant="body2" color="text.secondary" textAlign={showAvatar ? 'center' : 'left'}>
                        {String(position)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign={showAvatar ? 'center' : 'left'}>
                        {String(department)}
                    </Typography>
                </>
            )}
        </Box>
    );
};

// ThemeToggle subcomponent
import { useAppearance } from '@/hooks/use-appearance';
const ThemeToggle: FC = () => {
    const { appearance, toggleAppearance } = useAppearance();
    const icon = appearance === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />;
    const label = appearance === 'dark' ? 'Light mode' : 'Dark mode';
    return (
        <Tooltip title={`Toggle theme (${label})`}>
            <IconButton onClick={toggleAppearance} aria-label="Toggle theme">
                {icon}
            </IconButton>
        </Tooltip>
    );
};

// LogoutButton subcomponent
const LogoutButton: FC<{ onLogout: (e: FormEvent) => void }> = ({ onLogout }) => (
    <Box p={2}>
        <form onSubmit={onLogout} style={{ width: '100%' }}>
            <IconButton
                type="submit"
                color="error"
                sx={{
                    width: '100%',
                    borderRadius: 2,
                    bgcolor: '#f44336',
                    color: '#fff',
                    '&:hover': { bgcolor: '#d32f2f' },
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1,
                    py: 1.5,
                }}
                aria-label="Logout"
            >
                <LogoutIcon />
                <Typography variant="button" sx={{ color: '#fff', fontWeight: 600 }}>
                    Logout
                </Typography>
            </IconButton>
        </form>
    </Box>
);

// Main DashboardLayout
const DashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
    // Hooks and constants
    const { auth, ziggy, flash } = usePage<SharedData & any>().props as any;
    useEffect(() => {
        if (!auth?.user) {
            router.visit(route('login'));
        }
    }, [auth]);
    const { post } = useForm();

    // Responsive layout
    const isAdmin = auth?.user?.role === 'admin';
    const appName = (import.meta as any).env?.VITE_APP_NAME || 'Laravel';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [flashOpen, setFlashOpen] = React.useState(false);
    const flashMessage: string = (flash?.success as string) || (flash?.error as string) || '';
    const flashSeverity: 'success' | 'error' = flash?.error ? 'error' : 'success';

    useEffect(() => {
        if (flashMessage) setFlashOpen(true);
    }, [flashMessage]);

    // Memoized initials for avatar
    const initials = useMemo(() => {
        if (!auth.user.name) return '';
        return auth.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }, [auth.user.name]);

    // Navigation items array
    const navItems = isAdmin
        ? [
            { label: 'My Assets', route: route('users.dashboard'), name: 'users.dashboard' },
            { label: 'Assets', route: route('assets.main'), name: 'assets.main' },
            { label: 'Controls', route: route('controls.main'), name: 'controls.main' },
            { label: 'Roles', route: route('roles.main'), name: 'roles.main' },
            { label: 'Asset Types', route: route('asset-types.main'), name: 'asset-types.main' },
            { label: 'Control Types', route: route('control-types.main'), name: 'control-types.main' },
        ]
        : [
            { label: 'My Assets', route: route('users.dashboard'), name: 'users.dashboard' },
        ];

    // Helper to check if a route is active by route name
    const isActive = (routeName: string) => {
        return typeof route === 'function' && route().current() === routeName;
    };

    // Logout handler
    const handleLogout = (e: FormEvent) => {
        e.preventDefault();
        post(route('logout'));
    };

    const drawerContent = (
        <>
            <Box px={2} py={1.5} borderBottom={1} borderColor="divider" sx={{ borderRadius: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight={700}>{appName}</Typography>
                <ThemeToggle />
            </Box>
            {/* User Info */}
            <UserInfo
                name={String(auth.user.name)}
                avatar={typeof auth.user.avatar === 'string' ? auth.user.avatar : undefined}
                position={typeof auth.user.position === 'string' ? auth.user.position : undefined}
                department={typeof auth.user.department === 'string' ? auth.user.department : undefined}
                initials={initials}
            />
            {/* Navigation List */}
            <List sx={{ flexGrow: 0 }}>
                {navItems.map((item) => (
                    <ListItemButton
                        key={String(item.route)}
                        component={Link}
                        href={String(item.route)}
                        selected={isActive(String(item.name))}
                        aria-current={isActive(String(item.name)) ? 'page' : undefined}
                        sx={isActive(String(item.name))
                            ? { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, borderRadius: 2 }
                            : { borderRadius: 2 }}
                        onClick={() => { if (isMobile) setDrawerOpen(false); }}
                    >
                        <ListItemText primary={item.label} />
                    </ListItemButton>
                ))}
            </List>
            <Box flexGrow={1} />
            <Divider sx={{ my: 2 }} />
            {/* Logout Button at the bottom */}
            <LogoutButton onLogout={handleLogout} />
        </>
    );

    return (
        // If not authenticated, render nothing while redirecting
        !auth?.user ? null :
            <Box display="flex" minHeight="100vh" bgcolor="background.default" sx={{ width: '100%', overflowX: 'hidden' }}>
                {/* App bar for mobile */}
                {isMobile && (
                    <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                        <Toolbar>
                            <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} aria-label="Open navigation" sx={{ mr: 2 }}>
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>{appName}</Typography>
                            <ThemeToggle />
                        </Toolbar>
                    </AppBar>
                )}

                {/* Sidebar drawer */}
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? drawerOpen : true}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        display: { xs: 'block', md: 'block' },
                        [`& .MuiDrawer-paper`]: {
                            width: 240,
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            bgcolor: 'background.paper',
                            p: 2,
                            borderRadius: 0,
                        },
                    }}
                    ModalProps={{
                        keepMounted: true,
                        'aria-label': 'Sidebar navigation',
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Box component="main" flexGrow={1} p={{ xs: 2, md: 6 }} sx={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}>
                    {isMobile && <Toolbar />}
                    <Container maxWidth={false} disableGutters sx={{ bgcolor: 'background.paper', borderRadius: 0, boxShadow: 1, p: 4, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
                        {children}
                    </Container>
                    {flashMessage && (
                        <Snackbar
                            open={flashOpen}
                            autoHideDuration={4000}
                            onClose={() => setFlashOpen(false)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        >
                            <Alert severity={flashSeverity} variant="filled" onClose={() => setFlashOpen(false)} sx={{ boxShadow: 2 }}>
                                {flashMessage}
                            </Alert>
                        </Snackbar>
                    )}
                </Box>

            </Box>
    );
};

export default DashboardLayout; 