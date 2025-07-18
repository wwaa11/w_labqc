import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';

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

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setUserId('');
        setSelectedLocation('');
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('users.store'), {
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
        router.post(route('users.admin'), {
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
        router.post(route('users.store', editUserId), {
            userid: editUserId,
            location: editLocation,
        });
        handleEditClose();
    };
    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            router.delete(route('users.destroy', userId));
        }
    };

    return (
        <DashboardLayout>
            <Head title="Users" />
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
                <Typography variant="h4" fontWeight="bold">All Users</Typography>
                <Box display="flex" gap={2}>
                    <Button variant="contained" color="primary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleOpen} aria-label="Assign location by user ID">
                        Assign Location by User ID
                    </Button>
                    <Button variant="contained" color="secondary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleAdminOpen} aria-label="Add admin">
                        Add Admin
                    </Button>
                </Box>
            </Box>
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
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>Assign</Button>
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
                    <DialogActions>
                        <Button onClick={handleAdminClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="secondary" sx={{ borderRadius: 2, fontWeight: 600 }}>Add Admin</Button>
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
                    <DialogActions>
                        <Button onClick={handleEditClose}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, fontWeight: 600 }}>Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 1, mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users && users.map((user: any) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.user_id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.location || '-'}</TableCell>
                                <TableCell>
                                    <Button size="small" variant="outlined" color="primary" sx={{ borderRadius: 2, fontWeight: 600, mr: 1 }} onClick={() => handleEditOpen(user)} aria-label={`Edit location for user ${user.name}`}>Edit Location</Button>
                                    {user.user_id !== currentUserId && (
                                        <Button size="small" variant="outlined" color="error" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={() => handleDelete(user.id)} aria-label={`Delete user ${user.name}`}>Delete</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </DashboardLayout>
    );
} 