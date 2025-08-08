import { usePage, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl, IconButton, InputAdornment } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';


export default function UsersMain() {
    const { users, locations, auth } = usePage().props as any;
    const currentUserId = auth?.user?.user_id;
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [adminDialogOpen, setAdminDialogOpen] = useState(false);
    const [adminUserId, setAdminUserId] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editUserId, setEditUserId] = useState('');
    const [editLocation, setEditLocation] = useState('');

    const [search, setSearch] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    });
    const [input, setInput] = useState(search);
    const [massAssignOpen, setMassAssignOpen] = useState(false);
    const [massUserIds, setMassUserIds] = useState('');
    const [massLocation, setMassLocation] = useState('');

    useEffect(() => {
        setInput(search);
    }, [search]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setUserId('');
        setSelectedLocation('');
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('roles.store'), {
            userid: userId,
            location: selectedLocation,
        });
        handleClose();
    };

    const handleAdminOpen = () => setAdminDialogOpen(true);
    const handleAdminClose = () => {
        setAdminDialogOpen(false);
        setAdminUserId('');
    };
    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('roles.admin'), {
            userid: adminUserId,
        });
        handleAdminClose();
    };

    const handleEditOpen = (user: any) => {
        setEditUserId(user.user_id);
        setEditLocation(user.location || '');
        setEditDialogOpen(true);
    };
    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditUserId('');
        setEditLocation('');
    };
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('roles.store', editUserId), {
            userid: editUserId,
            location: editLocation,
        });
        handleEditClose();
    };
    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            router.delete(route('roles.destroy', userId));
        }
    };

    const [loading, setLoading] = useState(false);
    const handleSearch = () => {
        setLoading(true);
        router.get(route('roles.main'), { search: input }, { preserveState: true, replace: true, onFinish: () => setLoading(false) });
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };
    const handleReset = () => {
        setInput('');
        setSearch('');
        setLoading(true);
        router.get(route('roles.main'), {}, { preserveState: true, replace: true, onFinish: () => setLoading(false) });
    };
    const handleMassAssign = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('roles.massAssignLocation'), {
            user_ids: massUserIds,
            location: massLocation,
        }, {
            onSuccess: () => {
                setMassAssignOpen(false);
                setMassUserIds('');
                setMassLocation('');
            }
        });
    };

    const isMobile = false;
    const showGrid = true;

    return (
        <DashboardLayout>
            <Head title="Users" />
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                            Users
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage and organize your users
                        </Typography>
                    </Box>
                </Box>

                {/* Search and Actions */}
                <Paper sx={{ p: 3, mb: 4 }}>
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" width="100%">
                        <TextField
                            fullWidth
                            placeholder="Search by User ID"
                            value={input}
                            onChange={e => setInput(e.target.value)}
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
                        <Button variant="outlined" onClick={handleSearch} disabled={loading}>
                            Search
                        </Button>
                        <Button variant="outlined" onClick={handleReset} disabled={loading}>
                            Reset
                        </Button>
                        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
                            <Button variant="contained" color="primary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleOpen} aria-label="Assign location by user ID">
                                Assign Location
                            </Button>
                            <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => setMassAssignOpen(true)} aria-label="Mass assign location">
                                Mass Assign
                            </Button>
                            <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleAdminOpen} aria-label="Add admin">
                                Add Admin
                            </Button>
                        </Box>
                    </Box>
                </Paper>
                <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                    <DialogTitle>Assign Location to User</DialogTitle>
                    <form onSubmit={handleSubmit}>
                        <DialogContent>
                            <TextField
                                label="User ID"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="location-label">Location</InputLabel>
                                <Select
                                    labelId="location-label"
                                    value={selectedLocation}
                                    label="Location"
                                    onChange={e => setSelectedLocation(e.target.value)}
                                    required
                                >
                                    {locations && locations.length > 0 ? (
                                        locations.map((loc: string, idx: number) => (
                                            <MenuItem key={idx} value={loc}>{loc}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No locations available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                            <Button onClick={handleClose} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>Assign</Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <Dialog open={adminDialogOpen} onClose={handleAdminClose} PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                    <DialogTitle>Add Admin by User ID</DialogTitle>
                    <form onSubmit={handleAdminSubmit}>
                        <DialogContent>
                            <TextField
                                label="User ID"
                                value={adminUserId}
                                onChange={e => setAdminUserId(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                        </DialogContent>
                        <DialogActions sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                            <Button onClick={handleAdminClose} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>Add Admin</Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <Dialog open={editDialogOpen} onClose={handleEditClose} PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                    <DialogTitle>Edit User Location</DialogTitle>
                    <form onSubmit={handleEditSubmit}>
                        <DialogContent>
                            <TextField
                                label="User ID"
                                value={editUserId}
                                fullWidth
                                margin="normal"
                                disabled
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="edit-location-label">Location</InputLabel>
                                <Select
                                    labelId="edit-location-label"
                                    value={editLocation}
                                    label="Location"
                                    onChange={e => setEditLocation(e.target.value)}
                                    required
                                >
                                    {locations && locations.length > 0 ? (
                                        locations.map((loc: string, idx: number) => (
                                            <MenuItem key={idx} value={loc}>{loc}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No locations available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                            <Button onClick={handleEditClose} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>Save</Button>
                        </DialogActions>
                    </form>
                </Dialog>
                <Dialog open={massAssignOpen} onClose={() => setMassAssignOpen(false)} PaperProps={{ sx: { borderRadius: 3, p: 2 } }}>
                    <DialogTitle>Mass Assign Location</DialogTitle>
                    <form onSubmit={handleMassAssign}>
                        <DialogContent>
                            <TextField
                                label="User IDs (comma separated)"
                                value={massUserIds}
                                onChange={e => setMassUserIds(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="mass-location-label">Location</InputLabel>
                                <Select
                                    labelId="mass-location-label"
                                    value={massLocation}
                                    label="Location"
                                    onChange={e => setMassLocation(e.target.value)}
                                    required
                                >
                                    {locations && locations.length > 0 ? (
                                        locations.map((loc: string, idx: number) => (
                                            <MenuItem key={idx} value={loc}>{loc}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No locations available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </DialogContent>
                        <DialogActions sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                            <Button onClick={() => setMassAssignOpen(false)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}>Assign</Button>
                        </DialogActions>
                    </form>
                </Dialog>
                {/* Grid view only (no mobile list) */}
                <Box sx={{ width: '100%', mt: 2 }}>
                    <DataGrid
                        autoHeight
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 300 } } }}
                        rows={(users || []).map((u: any) => ({
                            id: u.id,
                            userId: u.user_id,
                            name: u.name,
                            position: u.position || '-',
                            department: u.department || '-',
                            role: u.role,
                            location: u.location || '-',
                        }))}
                        columns={[
                            { field: 'userId', headerName: 'User ID', width: 140 },
                            { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
                            { field: 'position', headerName: 'Position', width: 150 },
                            { field: 'department', headerName: 'Department', width: 160 },
                            { field: 'role', headerName: 'Role', width: 120 },
                            { field: 'location', headerName: 'Location', width: 140 },
                            {
                                field: 'actions', headerName: 'Actions', width: 180, sortable: false, filterable: false,
                                renderCell: (params) => (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button size="small" variant="outlined" onClick={() => handleEditOpen({
                                            id: params.id,
                                            user_id: params.row.userId,
                                            name: params.row.name,
                                            location: params.row.location,
                                        })}>
                                            Edit Location
                                        </Button>
                                        {params.row.userId !== currentUserId && (
                                            <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(String(params.id))}>
                                                Delete
                                            </Button>
                                        )}
                                    </Box>
                                )
                            }
                        ] as GridColDef[]}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Box>
        </DashboardLayout>
    );
} 