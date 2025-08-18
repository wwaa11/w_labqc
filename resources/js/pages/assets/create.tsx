import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';

export default function AssetsCreate() {
    const { assetTypes, locations, errors } = usePage().props as any;
    const [locationInput, setLocationInput] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { data, setData, post, processing } = useForm({
        asset_type_id: '',
        name: '',
        frequency: '',
        environment: '',
        brand: '',
        model: '',
        serial_number: '',
        location: '',
        memo: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmOpen(true);
    };

    const confirmSubmit = () => {
        setConfirmOpen(false);
        post(route('assets.store'));
    };

    const onChangeAssetType = (e: any) => {
        const value = e.target.value;
        setData('asset_type_id', value);
        const selected = (assetTypes || []).find((at: any) => String(at.id) === String(value));
        if (selected) {
            setData('name', selected.asset_type_name);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Create Asset" />
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
                        }}
                    >
                        Create Asset
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Add a new asset
                    </Typography>
                </Box>
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth error={!!errors?.asset_type_id}>
                                    <InputLabel id="at-label" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        Asset Type
                                    </InputLabel>
                                    <Select
                                        labelId="at-label"
                                        label="Asset Type"
                                        value={data.asset_type_id}
                                        onChange={onChangeAssetType}
                                        required
                                        sx={{
                                            '& .MuiSelect-select': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                        }}
                                    >
                                        <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                            <em>Select asset type</em>
                                        </MenuItem>
                                        {assetTypes.map((at: any) => (
                                            <MenuItem key={at.id} value={at.id} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                                {at.asset_type_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    error={!!errors?.name}
                                    helperText={errors?.name}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiFormHelperText-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Frequency"
                                    value={data.frequency}
                                    onChange={(e) => setData('frequency', e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Environment"
                                    value={data.environment}
                                    onChange={(e) => setData('environment', e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Brand"
                                    value={data.brand}
                                    onChange={(e) => setData('brand', e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Model"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Serial Number"
                                    value={data.serial_number}
                                    onChange={(e) => setData('serial_number', e.target.value)}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    freeSolo
                                    options={(locations || []).filter((loc: any) => loc && typeof loc === 'string')}
                                    inputValue={locationInput}
                                    onInputChange={(event, newInputValue: string) => {
                                        setLocationInput(newInputValue || '');
                                        setData('location', newInputValue || '');
                                    }}
                                    onChange={(event, newValue) => {
                                        setData('location', typeof newValue === 'string' ? newValue : '');
                                        setLocationInput(typeof newValue === 'string' ? newValue : '');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Location"
                                            fullWidth
                                            error={!!errors?.location}
                                            helperText={errors?.location}
                                            sx={{
                                                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                                '& .MuiFormHelperText-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                                            }}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Memo"
                                    value={data.memo}
                                    onChange={(e) => setData('memo', e.target.value)}
                                    multiline
                                    minRows={3}
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{
                                    display: 'flex',
                                    gap: 2,
                                    justifyContent: { xs: 'stretch', sm: 'flex-end' },
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => router.get(route('assets.main'))}
                                        disabled={processing}
                                        sx={{
                                            width: { xs: '100%', sm: 'auto' },
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={processing}
                                        sx={{
                                            width: { xs: '100%', sm: 'auto' },
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                    >
                                        {processing ? 'Creating...' : 'Create Asset'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Asset Creation</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Are you sure you want to create this asset?
                    </Typography>
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Asset Details:</Typography>
                        <Typography variant="body2"><strong>Name:</strong> {data.name || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Type:</strong> {assetTypes.find((at: any) => String(at.id) === String(data.asset_type_id))?.asset_type_name || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Location:</strong> {data.location || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Brand:</strong> {data.brand || 'N/A'}</Typography>
                        <Typography variant="body2"><strong>Model:</strong> {data.model || 'N/A'}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={confirmSubmit} variant="contained" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Asset'}
                    </Button>
                </DialogActions>
            </Dialog>
        </DashboardLayout>
    );
}


