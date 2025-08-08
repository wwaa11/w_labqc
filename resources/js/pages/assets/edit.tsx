import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function AssetsEdit() {
    const { asset, assetTypes, errors } = usePage().props as any;
    const { data, setData, post, processing } = useForm({
        asset_type_id: asset?.asset_type_id?.toString() || '',
        name: asset?.name || '',
        frequency: asset?.frequency || '',
        environment: asset?.environment || '',
        brand: asset?.brand || '',
        model: asset?.model || '',
        serial_number: asset?.serial_number || '',
        location: asset?.location || '',
        memo: asset?.memo || '',
    });

    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); post(route('assets.update', asset.id)); };

    return (
        <DashboardLayout>
            <Head title="Edit Asset" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Edit Asset</Typography>
                    <Typography variant="body1" color="text.secondary">Update asset information</Typography>
                </Box>
                <Paper sx={{ p: { xs: 2, md: 3 } }}>
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth error={!!errors?.asset_type_id}>
                                    <InputLabel id="at-label">Asset Type</InputLabel>
                                    <Select labelId="at-label" label="Asset Type" value={data.asset_type_id} onChange={(e) => setData('asset_type_id', e.target.value)} required>
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
                                    <Button type="submit" variant="contained" disabled={processing} sx={{ width: { xs: '100%', md: 'auto' } }}>{processing ? 'Saving...' : 'Save Changes'}</Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </DashboardLayout>
    );
}


