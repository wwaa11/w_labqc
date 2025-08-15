import { usePage, Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export default function ControlsMain() {
    const { controls } = usePage().props as any;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const onDelete = (id: number) => {
        setDeleteId(id);
        setConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId != null) {
            router.delete(route('controls.destroy', deleteId));
        }
        setConfirmOpen(false);
        setDeleteId(null);
    };

    return (
        <DashboardLayout>
            <Head title="Controls" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Controls</Typography>
                        <Typography variant="body1" color="text.secondary">Manage controls and their limit values</Typography>
                    </Box>
                    <Button variant="contained" onClick={() => router.get(route('controls.create'))} sx={{ width: { xs: '100%', md: 'auto' } }}>Add Control</Button>
                </Box>
                <Paper sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto' }}>
                    <DataGrid
                        autoHeight
                        rows={(controls || []).map((c: any) => {
                            // Handle single limitValue object instead of array
                            const limitValue = c.limitValues;
                            return ({
                                id: c.id,
                                name: c.control_name,
                                type: (c.control_type && c.control_type.control_type_name) ? c.control_type.control_type_name : '-',
                                limitType: c.limit_type,
                                expired: c.expired ? new Date(c.expired).toLocaleDateString() : '-',
                                memo: c.memo ?? '-',
                                isActive: !!c.is_active,
                                values: (() => {
                                    if (!limitValue) return '-';

                                    if (c.limit_type === 'range') {
                                        return `${limitValue.min_value ?? ''} - ${limitValue.max_value ?? ''}`;
                                    } else if (c.limit_type === 'option') {
                                        return limitValue.option_value ? limitValue.option_value.split(',').join(', ') : '-';
                                    } else if (c.limit_type === 'text') {
                                        return limitValue.text_value ?? '-';
                                    }
                                    return '-';
                                })(),
                            })
                        })}
                        columns={[
                            { field: 'name', headerName: 'Control', flex: 1, minWidth: 180 },
                            { field: 'type', headerName: 'Control Type', flex: 1, minWidth: 120 },
                            { field: 'limitType', headerName: 'Limit Type', flex: 0.7, minWidth: 120 },
                            { field: 'expired', headerName: 'Expired', flex: 0.6, minWidth: 120 },
                            { field: 'values', headerName: 'Values', flex: 1, minWidth: 200 },
                            { field: 'memo', headerName: 'Memo', flex: 1, minWidth: 200 },
                            { field: 'isActive', headerName: 'Active', width: 120, renderCell: (params) => params.value ? <Chip color="success" label="Active" size="small" /> : <Chip label="Inactive" size="small" /> },
                            {
                                field: 'actions', headerName: 'Actions', width: 200, sortable: false, filterable: false,
                                renderCell: (params) => (
                                    <Box>
                                        {!params.row.isActive && (
                                            <Button size="small" startIcon={<CheckIcon />} onClick={() => router.post(route('controls.setActive', params.id))}>Set Active</Button>
                                        )}
                                        <IconButton size="small" onClick={() => router.get(route('controls.edit', params.id))}><EditIcon /></IconButton>
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
                    <DialogTitle>Delete Control</DialogTitle>
                    <DialogContent>Are you sure you want to delete this control?</DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}


