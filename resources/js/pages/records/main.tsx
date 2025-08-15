import { usePage, Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { useState } from 'react';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

export default function RecordsMain() {
    const { records } = usePage().props as any;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'remove' | 'restore' | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [deleteMemo, setDeleteMemo] = useState('');

    // Filter states
    const [statusFilter, setStatusFilter] = useState('unapproved');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleAction = (id: number, type: 'approve' | 'remove' | 'restore') => {
        setSelectedId(id);
        setActionType(type);
        setDeleteMemo(''); // Reset memo when opening dialog
        setConfirmOpen(true);
    };

    const confirmAction = () => {
        if (actionType && selectedId) {
            if (actionType === 'approve') {
                router.post(route('records.approve', selectedId));
            } else if (actionType === 'remove') {
                const memo = deleteMemo.trim() ? `Deleted: ${deleteMemo}` : 'Deleted';
                router.delete(route('records.remove', selectedId), {
                    data: { memo }
                });
            } else if (actionType === 'restore') {
                router.post(route('records.restore', selectedId));
            }
        }
        setConfirmOpen(false);
        setSelectedId(null);
        setActionType(null);
        setDeleteMemo('');
    };

    const getStatusChip = (status: string, statusColor: string) => {
        return <Chip label={status} color={statusColor as any} size="small" />;
    };

    const applyFilters = () => {
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('records.main'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setStatusFilter('unapproved');
        setDateFrom('');
        setDateTo('');
        router.get(route('records.main'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <DashboardLayout>
            <Head title="Records Management" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Records Management</Typography>
                        <Typography variant="body1" color="text.secondary">Approve and manage control records</Typography>
                    </Box>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="unapproved">Unapproved</MenuItem>
                                <MenuItem value="approved">Approved</MenuItem>
                                <MenuItem value="deleted">Deleted Records</MenuItem>
                                <MenuItem value="all">All Records</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            label="Date From"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            size="small"
                            label="Date To"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                        <Button variant="contained" onClick={applyFilters}>
                            Apply Filters
                        </Button>

                        <Button variant="outlined" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </Box>
                </Paper>
                <Paper sx={{ p: { xs: 2, md: 3 }, overflowX: 'auto' }}>
                    <DataGrid
                        autoHeight
                        rows={(records || []).map((r: any) => ({
                            id: r.id,
                            assetType: r.asset_type_name || '-',
                            location: r.location || '-',
                            controlType: r.control_type?.control_type_name || '-',
                            recordValue: r.record_value,
                            recordResult: r.record_result || '-',
                            verifiedBy: r.verified_by || '-',
                            approvedBy: r.approved_by || '-',
                            status: r.status,
                            statusColor: r.status_color,
                            memo: r.memo || '-',
                            createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : '-',
                            updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleString() : '-',
                        }))}
                        columns={[
                            { field: 'assetType', headerName: 'Asset Type', flex: 1, minWidth: 150 },
                            { field: 'location', headerName: 'Location', flex: 0.8, minWidth: 120 },
                            { field: 'controlType', headerName: 'Control Type', flex: 1, minWidth: 150 },
                            { field: 'recordValue', headerName: 'Record Value', flex: 0.8, minWidth: 120 },
                            {
                                field: 'recordResult',
                                headerName: 'Result',
                                flex: 0.6,
                                minWidth: 100,
                                renderCell: (params) => {
                                    const result = params.row.recordResult;
                                    if (result === 'PASS') {
                                        return <Chip label="PASS" color="success" size="small" />;
                                    } else if (result === 'FAIL') {
                                        return <Chip label="FAIL" color="error" size="small" />;
                                    } else {
                                        return <span>{result}</span>;
                                    }
                                }
                            },
                            { field: 'verifiedBy', headerName: 'Verified By', flex: 0.8, minWidth: 120 },
                            {
                                field: 'status',
                                headerName: 'Status',
                                flex: 0.7,
                                minWidth: 120,
                                renderCell: (params) => getStatusChip(params.row.status, params.row.statusColor)
                            },
                            { field: 'memo', headerName: 'Memo', flex: 1, minWidth: 150 },
                            { field: 'createdAt', headerName: 'Created', flex: 0.8, minWidth: 150 },
                            {
                                field: 'actions',
                                headerName: 'Actions',
                                width: 200,
                                sortable: false,
                                filterable: false,
                                renderCell: (params) => {
                                    // Show restore button for deleted records
                                    if (params.row.status === 'Deleted') {
                                        return (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleAction(params.row.id, 'restore')}
                                                    title="Restore Record"
                                                >
                                                    <RestoreIcon />
                                                </IconButton>
                                            </Box>
                                        );
                                    }

                                    return (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {params.row.approvedBy === '-' && (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleAction(params.row.id, 'approve')}
                                                    title="Approve Record"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleAction(params.row.id, 'remove')}
                                                title="Remove Record"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    );
                                }
                            }
                        ] as GridColDef[]}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
                        disableRowSelectionOnClick
                        disableColumnMenu
                        hideFooterSelectedRowCount
                        sx={{
                            '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
                        }}
                    />
                </Paper>
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {actionType === 'approve' ? 'Approve Record' : actionType === 'remove' ? 'Remove Record' : 'Restore Record'}
                    </DialogTitle>
                    <DialogContent>
                        {actionType === 'approve' && (
                            <>
                                Are you sure you want to approve this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    This will stamp the record with your approval.
                                </Typography>
                            </>
                        )}
                        {actionType === 'remove' && (
                            <>
                                Are you sure you want to remove this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    This action cannot be undone. The record will be permanently removed.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason for deletion (optional)"
                                    placeholder="Enter the reason for deleting this record..."
                                    value={deleteMemo}
                                    onChange={(e) => setDeleteMemo(e.target.value)}
                                    sx={{ mt: 2 }}
                                />
                            </>
                        )}
                        {actionType === 'restore' && (
                            <>
                                Are you sure you want to restore this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    This will restore the record and make it available again.
                                </Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                        <Button
                            color={actionType === 'approve' ? 'success' : actionType === 'remove' ? 'error' : 'primary'}
                            variant="contained"
                            onClick={confirmAction}
                        >
                            {actionType === 'approve' ? 'Approve' : actionType === 'remove' ? 'Remove' : 'Restore'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
