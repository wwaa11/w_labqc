import { usePage, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Grid,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    InputAdornment,
    Alert,
    Skeleton,
    Tooltip,
    Avatar,
    Divider,
    Stack,
    Fab,
    useMediaQuery,
    useTheme as useMuiTheme,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useMemo } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '@mui/material/styles';

export default function ControlTypesMain() {
    const { controlTypes, auth } = usePage().props as any;
    const theme = useTheme();
    // Desktop-only (no responsiveness)
    const isMobile = false;

    const [search, setSearch] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    });
    const [input, setInput] = useState(search);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [controlTypeToDelete, setControlTypeToDelete] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setInput(search);
    }, [search]);

    const handleSearch = () => {
        setIsLoading(true);
        router.get(route('control-types.main'), { search: input }, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleReset = () => {
        setInput('');
        setSearch('');
        setIsLoading(true);
        router.get(route('control-types.main'), {}, {
            preserveState: true,
            replace: true,
            onFinish: () => setIsLoading(false)
        });
    };

    const handleDelete = (controlType: any) => {
        setControlTypeToDelete(controlType);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (controlTypeToDelete) {
            router.delete(route('control-types.destroy', controlTypeToDelete.id));
        }
        setDeleteDialogOpen(false);
        setControlTypeToDelete(null);
    };

    const handleEdit = (id: number) => {
        router.get(route('control-types.edit', id));
    };

    const handleCreate = () => {
        router.get(route('control-types.create'));
    };

    const handleRefresh = () => {
        setIsLoading(true);
        router.reload({
            onFinish: () => setIsLoading(false)
        });
    };

    // Filtered control types based on search
    const filteredControlTypes = useMemo(() => {
        if (!search) return controlTypes;
        return controlTypes.filter((controlType: any) =>
            controlType.control_type_name.toLowerCase().includes(search.toLowerCase()) ||
            (controlType.assetType?.asset_type_name && controlType.assetType.asset_type_name.toLowerCase().includes(search.toLowerCase()))
        );
    }, [controlTypes, search]);

    // Statistics
    const stats = useMemo(() => ({
        total: controlTypes.length,
        active: controlTypes.filter((ct: any) => !ct.is_deleted).length,
        deleted: controlTypes.filter((ct: any) => ct.is_deleted).length,
        withControls: controlTypes.filter((ct: any) => ct.controls && ct.controls.length > 0).length,
    }), [controlTypes]);

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card
            sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${color}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${color}20`,
                }
            }}
        >
            <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: color }}>
                            {value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {title}
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: `${color}20`,
                            color: color,
                            width: 30,
                            height: 30
                        }}
                    >
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );

    const ControlTypeCard = ({ controlType }: any) => (
        <Card
            sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.palette.mode === 'light'
                        ? '0 12px 40px rgba(0,0,0,0.1)'
                        : '0 12px 40px rgba(0,0,0,0.3)',
                }
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                            {controlType.control_type_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            ID: {controlType.id}
                        </Typography>
                    </Box>
                    <Chip
                        label={controlType.is_deleted ? 'Deleted' : 'Active'}
                        size="small"
                        color={controlType.is_deleted ? 'error' : 'success'}
                        icon={controlType.is_deleted ? <CancelIcon /> : <CheckCircleIcon />}
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Associated Asset Type
                        </Typography>
                        {controlType.assetType ? (
                            <Chip
                                label={controlType.assetType.asset_type_name}
                                size="small"
                                color="primary"
                                variant="outlined"
                                icon={<CategoryIcon />}
                            />
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No asset type assigned
                            </Typography>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Controls Count
                        </Typography>
                        <Typography variant="body2">
                            {controlType.controls ? controlType.controls.length : 0} controls
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Created
                        </Typography>
                        <Typography variant="body2">
                            {new Date(controlType.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </Typography>
                    </Box>
                </Stack>

                <Box sx={{ display: 'flex', gap: 1, mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Tooltip title="Edit Control Type">
                        <IconButton
                            size="small"
                            onClick={() => handleEdit(controlType.id)}
                            sx={{
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: `${theme.palette.primary.main}15`,
                                }
                            }}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Control Type">
                        <IconButton
                            size="small"
                            onClick={() => handleDelete(controlType)}
                            sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: `${theme.palette.error.main}15`,
                                }
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <DashboardLayout>
            <Head title="Control Types Management" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Header Section */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    mb: 4,
                    gap: 2
                }}>
                    <Box>
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                            Control Types
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage and organize your control type categories
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, width: { xs: '100%', md: 'auto' } }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreate}
                            size="large"
                            sx={{
                                width: { xs: '100%', md: 'auto' },
                                height: 48,
                                px: 3,
                            }}
                        >
                            Add Control Type
                        </Button>
                    </Box>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={3}>
                        <StatCard
                            title="Total Types"
                            value={stats.total}
                            icon={<CategoryIcon />}
                            color={theme.palette.primary.main}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatCard
                            title="With Controls"
                            value={stats.withControls}
                            icon={<InfoIcon />}
                            color={theme.palette.info.main}
                        />
                    </Grid>
                </Grid>

                {/* Search and Filters Section */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            fullWidth
                            placeholder="Search control types by name or associated asset type..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {input && (
                                                <IconButton size="small" onClick={() => setInput('')} aria-label="Clear search">
                                                    <CloseIcon />
                                                </IconButton>
                                            )}
                                            <IconButton size="small" onClick={handleSearch} aria-label="Search">
                                                <SearchIcon />
                                            </IconButton>
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 300 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={handleSearch}
                            disabled={isLoading}
                            sx={{ minWidth: 100 }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleReset}
                            disabled={isLoading}
                            sx={{ minWidth: 100 }}
                        >
                            Reset
                        </Button>
                        <Box sx={{ ml: 'auto' }}>
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>

                {/* Control Types Data View */}
                {isLoading ? (
                    <Grid container spacing={3}>
                        {[...Array(6)].map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card>
                                    <CardContent sx={{ p: 3 }}>
                                        <Skeleton variant="text" width="60%" height={32} />
                                        <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                                        <Skeleton variant="rectangular" height={60} sx={{ mt: 2, borderRadius: 1 }} />
                                        <Skeleton variant="text" width="80%" height={20} sx={{ mt: 2 }} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : filteredControlTypes.length === 0 ? (
                    <Paper sx={{ p: 6, textAlign: 'center' }}>
                        <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            {search ? 'No control types found' : 'No control types yet'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {search
                                ? 'Try adjusting your search criteria'
                                : 'Get started by creating your first control type'
                            }
                        </Typography>
                        {!search && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleCreate}
                            >
                                Create First Control Type
                            </Button>
                        )}
                    </Paper>
                ) : (
                    <>
                        {/* Grid view only (no mobile list) */}
                        <Box sx={{ width: '100%' }}>
                            <DataGrid
                                autoHeight
                                rows={filteredControlTypes.map((ct: any) => ({
                                    id: ct.id,
                                    name: ct.control_type_name,
                                    assetType: ct.asset_type?.asset_type_name
                                        ?? ct.asset?.asset_type_name
                                        ?? ct.assetType?.asset_type_name
                                        ?? '-',
                                }))}
                                columns={[
                                    { field: 'id', headerName: 'ID', width: 80 },
                                    { field: 'name', headerName: 'Control Type', flex: 1, minWidth: 220 },
                                    { field: 'assetType', headerName: 'Asset Type', flex: 1, minWidth: 220 },
                                    {
                                        field: 'actions', headerName: 'Actions', width: 140, sortable: false, filterable: false,
                                        renderCell: (params) => (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton size="small" onClick={() => handleEdit(Number(params.id))} aria-label="Edit">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete({ id: params.id, control_type_name: params.row.name })} aria-label="Delete">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        )
                                    }
                                ] as GridColDef[]}
                                pageSizeOptions={[10, 25, 50]}
                                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                                disableRowSelectionOnClick
                            />
                        </Box>
                    </>
                )}

                {/* Floating Action Button removed in desktop-only mode */}
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Confirm Delete
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This action cannot be undone.
                    </Alert>
                    <Typography variant="body1">
                        Are you sure you want to delete the control type{' '}
                        <strong>"{controlTypeToDelete?.control_type_name}"</strong>?
                    </Typography>
                    {(() => {
                        const name = controlTypeToDelete?.asset_type?.asset_type_name
                            ?? controlTypeToDelete?.asset?.asset_type_name
                            ?? controlTypeToDelete?.assetType?.asset_type_name;
                        return !!name;
                    })() && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {(() => {
                                    const name = controlTypeToDelete?.asset_type?.asset_type_name
                                        ?? controlTypeToDelete?.asset?.asset_type_name
                                        ?? controlTypeToDelete?.assetType?.asset_type_name;
                                    return `This will also remove the association with asset type "${name}".`;
                                })()}
                            </Typography>
                        )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
} 