import { usePage, Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
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
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    mb: { xs: 2, sm: 3 },
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' }
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
                            Records Management
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Approve and manage control records
                        </Typography>
                    </Box>
                </Box>

                {/* Filters */}
                <Paper elevation={1} sx={{
                    p: { xs: 2, sm: 3 },
                    mb: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2
                    }}>
                        <FilterListIcon color="primary" fontSize="small" />
                        <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, fontWeight: 600 }}>
                            Filter Records
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(200px, 1fr))' },
                        gap: { xs: 2, sm: 2 },
                        alignItems: 'end'
                    }}>
                        <FormControl size="small" fullWidth>
                            <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Status
                            </InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{
                                    '& .MuiSelect-select': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                }}
                            >
                                <MenuItem value="unapproved" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    Unapproved
                                </MenuItem>
                                <MenuItem value="approved" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    Approved
                                </MenuItem>
                                <MenuItem value="deleted" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    Deleted Records
                                </MenuItem>
                                <MenuItem value="all" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                    All Records
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            label="Date From"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />

                        <TextField
                            size="small"
                            label="Date To"
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                            }}
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 2,
                        justifyContent: { xs: 'stretch', sm: 'flex-start' }
                    }}>
                        <Button
                            variant="contained"
                            onClick={applyFilters}
                            startIcon={<SearchIcon />}
                            sx={{
                                flex: { xs: 1, sm: 'none' },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1, sm: 1.5 }
                            }}
                        >
                            Apply Filters
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={clearFilters}
                            startIcon={<ClearIcon />}
                            sx={{
                                flex: { xs: 1, sm: 'none' },
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1, sm: 1.5 }
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Paper>
                <Paper sx={{ p: { xs: 2, sm: 3 }, height: '600px', overflow: 'hidden' }}>
                    <DataGrid
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
                            { field: 'assetType', headerName: 'Asset Type', flex: 1, minWidth: 150, sortable: true, filterable: true },
                            { field: 'location', headerName: 'Location', flex: 0.8, minWidth: 120, sortable: true, filterable: true },
                            { field: 'controlType', headerName: 'Control Type', flex: 1, minWidth: 150, sortable: true, filterable: true },
                            { field: 'recordValue', headerName: 'Record Value', flex: 0.8, minWidth: 120, sortable: true, filterable: true },
                            {
                                field: 'recordResult',
                                headerName: 'Result',
                                flex: 0.6,
                                minWidth: 100,
                                sortable: true,
                                filterable: true,
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
                            { field: 'verifiedBy', headerName: 'Verified By', flex: 0.8, minWidth: 120, sortable: true, filterable: true },
                            {
                                field: 'status',
                                headerName: 'Status',
                                flex: 0.7,
                                minWidth: 120,
                                sortable: true,
                                filterable: true,
                                renderCell: (params) => getStatusChip(params.row.status, params.row.statusColor)
                            },
                            { field: 'memo', headerName: 'Memo', flex: 1, minWidth: 150, sortable: true, filterable: true },
                            { field: 'createdAt', headerName: 'Created', flex: 0.8, minWidth: 150, sortable: true, filterable: true },
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
                        pagination
                        paginationModel={{ page: 0, pageSize: 25 }}
                        pageSizeOptions={[10, 25, 50, 100]}
                        onPaginationModelChange={(model) => {
                            // Handle pagination changes if needed
                        }}
                        disableRowSelectionOnClick
                        disableColumnMenu={false}
                        hideFooterSelectedRowCount
                        autoHeight={false}
                        sx={{
                            '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
                            '& .MuiDataGrid-cell': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                            '& .MuiDataGrid-columnHeader': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                            '& .MuiDataGrid-footerContainer': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                        }}
                    />
                </Paper>
                <Dialog
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    fullWidth
                    maxWidth="sm"
                    fullScreen={window.innerWidth < 600}
                >
                    <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        {actionType === 'approve' ? 'Approve Record' : actionType === 'remove' ? 'Remove Record' : 'Restore Record'}
                    </DialogTitle>
                    <DialogContent sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {actionType === 'approve' && (
                            <>
                                Are you sure you want to approve this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    This will stamp the record with your approval.
                                </Typography>
                            </>
                        )}
                        {actionType === 'remove' && (
                            <>
                                Are you sure you want to remove this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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
                                    sx={{
                                        mt: 2,
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </>
                        )}
                        {actionType === 'restore' && (
                            <>
                                Are you sure you want to restore this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                    This will restore the record and make it available again.
                                </Typography>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                        <Button
                            onClick={() => setConfirmOpen(false)}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Cancel
                        </Button>
                        <Button
                            color={actionType === 'approve' ? 'success' : actionType === 'remove' ? 'error' : 'primary'}
                            variant="contained"
                            onClick={confirmAction}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            {actionType === 'approve' ? 'Approve' : actionType === 'remove' ? 'Remove' : 'Restore'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
