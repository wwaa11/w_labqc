import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function AssetsCreate() {
    const { assetTypes, errors } = usePage().props as any;
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

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); post(route('assets.store')); };

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
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Create Asset</Typography>
                    <Typography variant="body1" color="text.secondary">Add a new asset</Typography>
                </Box>
                <Paper sx={{ p: { xs: 2, md: 3 } }}>
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={!!errors?.asset_type_id}>
                                    <InputLabel id="at-label">Asset Type</InputLabel>
                                    <Select labelId="at-label" label="Asset Type" value={data.asset_type_id} onChange={onChangeAssetType} required>
                                        <MenuItem value=""><em>Select asset type</em></MenuItem>
                                        {assetTypes.map((at: any) => (<MenuItem key={at.id} value={at.id}>{at.asset_type_name}</MenuItem>))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} required error={!!errors?.name} helperText={errors?.name} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Frequency" value={data.frequency} onChange={(e) => setData('frequency', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Environment" value={data.environment} onChange={(e) => setData('environment', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Model" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth label="Serial Number" value={data.serial_number} onChange={(e) => setData('serial_number', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Location" value={data.location} onChange={(e) => setData('location', e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Memo" value={data.memo} onChange={(e) => setData('memo', e.target.value)} multiline minRows={3} />
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' }, flexDirection: { xs: 'column', md: 'row' } }}>
                                    <Button variant="outlined" onClick={() => router.get(route('assets.main'))} disabled={processing} sx={{ width: { xs: '100%', md: 'auto' } }}>Cancel</Button>
                                    <Button type="submit" variant="contained" disabled={processing} sx={{ width: { xs: '100%', md: 'auto' } }}>{processing ? 'Creating...' : 'Create Asset'}</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </DashboardLayout>
    );
}


