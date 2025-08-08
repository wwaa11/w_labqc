import { usePage, Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

export default function AssetsMain() {
    const { assets } = usePage().props as any;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const onDelete = (id: number) => { setDeleteId(id); setConfirmOpen(true); };
    const confirmDelete = () => { if (deleteId != null) router.delete(route('assets.destroy', deleteId)); setConfirmOpen(false); setDeleteId(null); };

    return (
        <DashboardLayout>
            <Head title="Assets" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Assets</Typography>
                        <Typography variant="body1" color="text.secondary">Manage lab assets</Typography>
                    </Box>
                    <Button variant="contained" onClick={() => router.get(route('assets.create'))} sx={{ width: { xs: '100%', md: 'auto' } }}>Add Asset</Button>
                </Box>
                <Paper sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto' }}>
                    <DataGrid
                        autoHeight
                        rows={(assets || []).map((a: any) => ({
                            id: a.id,
                            name: a.name,
                            type: a.asset_type?.asset_type_name ?? '-',
                            brand: a.brand ?? '-',
                            model: a.model ?? '-',
                            serial: a.serial_number ?? '-',
                            location: a.location ?? '-',
                        }))}
                        columns={[
                            { field: 'name', headerName: 'Asset', flex: 1, minWidth: 180 },
                            { field: 'type', headerName: 'Asset Type', flex: 1, minWidth: 180 },
                            { field: 'brand', headerName: 'Brand', flex: 0.8, minWidth: 140 },
                            { field: 'model', headerName: 'Model', flex: 0.8, minWidth: 140 },
                            { field: 'serial', headerName: 'Serial', flex: 0.8, minWidth: 160 },
                            { field: 'location', headerName: 'Location', flex: 0.8, minWidth: 160 },
                            {
                                field: 'actions', headerName: 'Actions', width: 160, sortable: false, filterable: false,
                                renderCell: (params) => (
                                    <Box>
                                        <IconButton size="small" onClick={() => router.get(route('assets.edit', params.id))}><EditIcon /></IconButton>
                                        <IconButton size="small" color="error" onClick={() => onDelete(Number(params.id))}><DeleteIcon /></IconButton>
                                    </Box>
                                )
                            }
                        ] as GridColDef[]}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterSelectedRowCount
                        sx={{
                            '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
                        }}
                    />
                </Paper>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Delete Asset</DialogTitle>
                    <DialogContent>Are you sure you want to delete this asset?</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}


