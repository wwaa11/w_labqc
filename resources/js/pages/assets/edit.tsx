import DashboardLayout from '@/layouts/dashboard';
import { useForm, usePage, router } from '@inertiajs/react';
import { Box, Button, TextField, Typography, Paper, Grid, Card, CardContent, IconButton, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useState } from 'react';

export default function EditAsset() {
    const { asset, controls, current_controls } = usePage().props as any;

    const { data, setData, put, processing, errors } = useForm({
        name: asset.name || '',
        type: asset.type || '',
        environment: asset.environment || '',
        frequency: asset.frequency || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        location: asset.location || '',
        memo: asset.memo || '',
        controls: current_controls || [],
    });

    // For dynamic control fields
    const [controlFields, setControlFields] = useState<number[]>(data.controls.length > 0 ? data.controls : []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

    const handleControlChange = (idx: number, value: number) => {
        const updated = [...controlFields];
        updated[idx] = value;
        setControlFields(updated);
        setData('controls', updated);
    };

    const addControlField = () => {
        setControlFields([...controlFields, 0]);
        setData('controls', [...controlFields, 0]);
    };

    const removeControlField = (idx: number) => {
        const updated = controlFields.filter((_, i) => i !== idx);
        setControlFields(updated);
        setData('controls', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('assets.update', asset.id));
    };

    return (
        <DashboardLayout>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto', mt: 4 }}>
                <Typography variant="h5" mb={3} fontWeight="bold">
                    Edit Asset
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Name"
                                name="name"
                                value={data.name}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="Type"
                                name="type"
                                value={data.type}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.type}
                                helperText={errors.type}
                            >
                                <MenuItem value="">Select Type</MenuItem>
                                <MenuItem value="Glucose">Glucose</MenuItem>
                                <MenuItem value="Protein">Protein</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Environment"
                                name="environment"
                                value={data.environment}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.environment}
                                helperText={errors.environment}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Frequency"
                                name="frequency"
                                value={data.frequency}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errors.frequency}
                                helperText={errors.frequency}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Brand"
                                name="brand"
                                value={data.brand}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.brand}
                                helperText={errors.brand}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Model"
                                name="model"
                                value={data.model}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.model}
                                helperText={errors.model}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Serial Number"
                                name="serial_number"
                                value={data.serial_number}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.serial_number}
                                helperText={errors.serial_number}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Location"
                                name="location"
                                value={data.location}
                                onChange={handleChange}
                                fullWidth
                                error={!!errors.location}
                                helperText={errors.location}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Memo"
                                name="memo"
                                value={data.memo}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={2}
                                error={!!errors.memo}
                                helperText={errors.memo}
                            />
                        </Grid>
                        {/* Controls Section */}
                        <Grid item xs={12}>
                            <Card variant="outlined" sx={{ mt: 2 }}>
                                <CardContent>
                                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                        <Typography variant="subtitle1" fontWeight="bold">Controls</Typography>
                                        <Button startIcon={<AddIcon />} onClick={addControlField} size="small" variant="contained">
                                            Add Control
                                        </Button>
                                    </Box>
                                    {controlFields.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">No controls added. Click 'Add Control' to add.</Typography>
                                    )}
                                    {controlFields.map((controlId, idx) => (
                                        <Box key={idx} display="flex" alignItems="center" mb={1}>
                                            <TextField
                                                select
                                                label={`Control #${idx + 1}`}
                                                value={controlId === 0 ? '' : controlId}
                                                onChange={e => handleControlChange(idx, Number(e.target.value))}
                                                sx={{ minWidth: 400, width: 400 }}
                                                size="small"
                                                error={!!(errors.controls && errors.controls[idx])}
                                                helperText={errors.controls && errors.controls[idx]}
                                            >
                                                <MenuItem value="" disabled>Select Control</MenuItem>
                                                {controls && controls.map((control: any) => (
                                                    <MenuItem key={control.id} value={control.id}>{control.name} : {control.limit}</MenuItem>
                                                ))}
                                            </TextField>
                                            <IconButton aria-label="Remove" color="error" onClick={() => removeControlField(idx)}>
                                                <RemoveCircleOutlineIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={processing}
                                sx={{ mt: 2 }}
                            >
                                Update Asset
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </DashboardLayout>
    );
} 