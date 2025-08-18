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
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mb: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2
                }}>
                    <Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
                            }}
                        >
                            Assets
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Manage lab assets
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={() => router.get(route('assets.create'))}
                        sx={{
                            width: { xs: '100%', sm: 'auto' },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Add Asset
                    </Button>
                </Box>
                <Paper sx={{ p: { xs: 2, sm: 3 }, overflowX: 'auto' }}>
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
                            '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
                            '& .MuiDataGrid-cell': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                            '& .MuiDataGrid-columnHeader': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                            '& .MuiDataGrid-root': { overflowX: 'auto' },
                            '& .MuiDataGrid-main': { overflowX: 'auto' }
                        }}
                    />
                </Paper>
                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    fullWidth
                    maxWidth="xs"
                    fullScreen={window.innerWidth < 600}
                >
                    <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Delete Asset
                    </DialogTitle>
                    <DialogContent sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Are you sure you want to delete this asset?
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            onClick={confirmDelete}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}


