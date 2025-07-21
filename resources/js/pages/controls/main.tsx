import DashboardLayout from '@/layouts/dashboard';
import { usePage, router, Head } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

export default function ControlMain() {
    const { controls } = usePage().props as any;
    const [search, setSearch] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || '';
        }
        return '';
    });
    const [input, setInput] = useState(search);

    useEffect(() => {
        setInput(search);
    }, [search]);

    const handleSearch = () => {
        router.get(route('controls.main'), { search: input }, { preserveState: true, replace: true });
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleReset = () => {
        setInput('');
        setSearch('');
        router.get(route('controls.main'), {}, { preserveState: true, replace: true });
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this control?')) {
            router.delete(route('controls.destroy', id));
        }
    };

    const handleEdit = (id: number) => {
        router.visit(route('controls.edit', id));
    };

    const handleCreate = () => {
        router.visit(route('controls.create'));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        { field: 'name', headerName: 'Name', flex: 1 },
        { field: 'limit', headerName: 'Control', flex: 1 },
        { field: 'expired', headerName: 'Expired', flex: 1 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
                <>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleEdit(params.row.id)}
                        sx={{ mr: 1 }}
                        aria-label={`Edit control ${params.row.name}`}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                        aria-label={`Delete control ${params.row.name}`}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    const theme = useTheme();

    return (
        <DashboardLayout>
            <Head title="Controls" />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">Controls</Typography>
                <Paper
                    component="form"
                    onSubmit={e => { e.preventDefault(); handleSearch(); }}
                    sx={{ display: 'flex', alignItems: 'center', borderRadius: '5px', boxShadow: 0, px: 1, py: 0.5, mr: 2, minWidth: 260, bgcolor: theme.palette.mode === 'light' ? theme.palette.grey[100] : 'background.paper' }}
                    elevation={1}
                >
                    <TextField
                        label="Search by name"
                        size="small"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        sx={{ flex: 1, minWidth: 120, bgcolor: 'transparent', pr: 1 }}
                    />
                    <Button type="submit" variant="text" color="primary" sx={{ minWidth: 40, p: 1 }} aria-label="Search">
                        <SearchIcon />
                    </Button>
                    {input && (
                        <Button type="button" variant="text" color="secondary" sx={{ minWidth: 40, p: 1 }} aria-label="Reset filter" onClick={handleReset}>
                            <CloseIcon />
                        </Button>
                    )}
                </Paper>
                <Button variant="contained" color="primary" size="large" sx={{ borderRadius: 2, fontWeight: 600 }} onClick={handleCreate} aria-label="Create new control">
                    Create New Control
                </Button>
            </Box>
            <Box sx={{ height: 500, width: '100%', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1, p: 2 }}>
                <DataGrid
                    rows={controls || []}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10, page: 0 } },
                    }}
                    disableRowSelectionOnClick
                    getRowId={(row) => row.id}
                    sx={{
                        borderRadius: 2,
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.100', fontWeight: 700 },
                        '& .MuiDataGrid-row': { bgcolor: 'background.default' },
                        '& .MuiDataGrid-cell': { py: 1 },
                    }}
                />
            </Box>
        </DashboardLayout>
    );
}
