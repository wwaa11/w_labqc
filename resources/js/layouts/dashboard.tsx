import React from 'react';
import { type SharedData } from '@/types';
import { usePage, Link, useForm, router } from '@inertiajs/react';
import { Box, Container, Drawer, List, ListItemText, ListItemButton, Avatar, Divider, Typography, useMediaQuery, Theme, IconButton, ListSubheader } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTheme } from '@mui/material/styles';
import { useMemo, FC, ReactNode, FormEvent } from 'react';
import { useAppearance } from '../hooks/use-appearance';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect } from 'react';

// UserInfo subcomponent
const UserInfo: FC<{ name: string; avatar?: string; position?: string; department?: string; initials: string }> = ({
    name,
    avatar,
    position,
    department,
    initials,
}) => (
    <Box p={3} display="flex" flexDirection="column" alignItems="center" borderBottom={1} borderColor="divider">
        <Avatar sx={{ width: 56, height: 56, mb: 1 }} src={avatar || undefined}>
            {initials}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
            {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {String(position)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            {String(department)}
        </Typography>
    </Box>
);

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
    const { auth, ziggy } = usePage<SharedData>().props;
    useEffect(() => {
        if (!auth?.user) {
            router.visit(route('login'));
        }
    }, [auth]);
    const { post } = useForm();
    const theme = useTheme();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const isAdmin = auth?.user?.role === 'admin';
    const { appearance, updateAppearance } = useAppearance();
    const [drawerOpen, setDrawerOpen] = React.useState(!isMobile);
    React.useEffect(() => {
        setDrawerOpen(!isMobile);
    }, [isMobile]);

    // Memoized initials for avatar
    const initials = useMemo(() => {
        if (!auth.user.name) return '';
        return auth.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }, [auth.user.name]);

    // Navigation items array
    const navItems = isAdmin
        ? [
            { label: 'My Assets', route: route('index'), name: 'index' },
            { label: 'Monitoring', route: route('monitoring'), name: 'monitoring' },
            { section: 'Management' },
            { label: 'Assets', route: route('assets.main'), name: 'assets.main' },
            { label: 'Controls', route: route('controls.main'), name: 'controls.main' },
            { label: 'Users', route: route('users.main'), name: 'users.main' },
        ]
        : [
            { label: 'My Assets', route: route('index'), name: 'index' },
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

    return (
        // If not authenticated, render nothing while redirecting
        !auth?.user ? null :
            <Box display="flex" minHeight="100vh" bgcolor="background.default">
                {isMobile && (
                    <IconButton
                        aria-label="Open navigation"
                        onClick={() => setDrawerOpen(true)}
                        sx={{
                            position: 'fixed',
                            top: 20,
                            left: 20,
                            zIndex: 1400,
                            bgcolor: 'background.paper',
                            border: '1.5px solid',
                            borderColor: 'divider',
                            boxShadow: 3,
                            width: 56,
                            height: 56,
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'grey.100',
                                color: 'primary.dark',
                            },
                        }}
                    >
                        <MenuIcon sx={{ fontSize: 32 }} />
                    </IconButton>
                )}
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: 240,
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '100vh',
                            bgcolor: 'background.paper',
                            p: 2,
                        },
                    }}
                    ModalProps={{
                        keepMounted: true,
                        'aria-label': 'Sidebar navigation',
                    }}
                >
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
                        {navItems.map((item, idx) => (
                            item.section ? (
                                <React.Fragment key={item.section}>
                                    <Divider sx={{ my: 1 }} />
                                    <ListSubheader sx={{ bgcolor: 'background.paper', color: 'text.secondary', fontWeight: 700, fontSize: '0.9rem', pl: 0 }} disableSticky>{item.section}</ListSubheader>
                                </React.Fragment>
                            ) : (
                                item.route && item.name ? (
                                    <ListItemButton
                                        key={String(item.route)}
                                        component={Link}
                                        href={String(item.route)}
                                        selected={isActive(String(item.name))}
                                        aria-current={isActive(String(item.name)) ? 'page' : undefined}
                                        sx={isActive(String(item.name))
                                            ? { bgcolor: 'primary.light', color: 'primary.main', fontWeight: 700, borderRadius: 2 }
                                            : { borderRadius: 2 }}
                                        onClick={() => isMobile && setDrawerOpen(false)}
                                    >
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                ) : null
                            )
                        ))}
                    </List>
                    {/* Dark Mode Toggle */}
                    <Box px={2} py={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Theme</Typography>
                        <Box display="flex" gap={1}>
                            <IconButton
                                aria-label="Light mode"
                                color={appearance === 'light' ? 'primary' : 'default'}
                                onClick={() => updateAppearance('light')}
                            >
                                <LightModeIcon />
                            </IconButton>
                            <IconButton
                                aria-label="Dark mode"
                                color={appearance === 'dark' ? 'primary' : 'default'}
                                onClick={() => updateAppearance('dark')}
                            >
                                <DarkModeIcon />
                            </IconButton>
                            <IconButton
                                aria-label="System mode"
                                color={appearance === 'system' ? 'primary' : 'default'}
                                onClick={() => updateAppearance('system')}
                            >
                                <SettingsBrightnessIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box flexGrow={1} />
                    <Divider sx={{ my: 2 }} />
                    {/* Logout Button at the bottom */}
                    <LogoutButton onLogout={handleLogout} />
                </Drawer>
                <Box component="main" flexGrow={1} p={{ xs: 2, sm: 4, md: 6 }}>
                    <Container maxWidth="lg" sx={{ bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: { xs: 2, sm: 4 } }}>
                        {children}
                    </Container>
                </Box>
            </Box>
    );
};

export default DashboardLayout; 