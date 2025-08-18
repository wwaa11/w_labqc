import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/RemoveCircleOutline';

export default function ControlsEdit() {
    const { control, controlTypes, errors } = usePage().props as any;

    // Ensure controlTypes is always an array
    const safeControlTypes = Array.isArray(controlTypes) ? controlTypes : [];

    // Initialize form data with proper fallbacks
    const initial = {
        control_name: control?.control_name || '',
        control_type_id: control?.control_type_id?.toString() || '',
        brand: control?.brand || '',
        lot: control?.lot || '',
        expired: control?.expired ? String(control.expired).slice(0, 10) : '',
        limit_type: (control?.limit_type || 'range') as 'range' | 'option' | 'text',
        min_value: control?.min_value || '',
        max_value: control?.max_value || '',
        options: Array.isArray(control?.options) && control.options.length > 0
            ? control.options.filter((opt: string) => opt !== null && opt !== '')
            : [''],
        text_value: control?.text_value || '',
        memo: control?.memo || '',
    };

    const { data, setData, post, processing } = useForm(initial);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (control?.id) {
            post(route('controls.update', control.id));
        }
    };

    const addOption = () => setData('options', [...data.options, '']);
    const removeOption = (idx: number) => setData('options', data.options.filter((_: string, i: number) => i !== idx));
    const updateOption = (idx: number, value: string) => setData('options', data.options.map((v: string, i: number) => (i === idx ? value : v)));

    return (
        <DashboardLayout>
            <Head title="Edit Control" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Edit Control</Typography>
                    <Typography variant="body1" color="text.secondary">Update control information and limits</Typography>
                </Box>

                <Paper sx={{ p: { xs: 2, md: 3 } }}>
                    {!control ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                                Loading control data...
                            </Typography>
                        </Box>
                    ) : (
                        <form onSubmit={onSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Control Name"
                                        value={data.control_name}
                                        onChange={(e) => setData('control_name', e.target.value)}
                                        required
                                        error={!!errors?.control_name}
                                        helperText={errors?.control_name}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth error={!!errors?.control_type_id}>
                                        <InputLabel id="ct-label">Control Type</InputLabel>
                                        <Select
                                            labelId="ct-label"
                                            label="Control Type"
                                            value={data.control_type_id}
                                            onChange={(e) => setData('control_type_id', e.target.value)}
                                            required
                                        >
                                            {safeControlTypes.map((ct: any) => (
                                                <MenuItem key={ct.id} value={ct.id}>
                                                    {ct.asset_type?.asset_type_name
                                                        ? `${ct.asset_type.asset_type_name} - ${ct.control_type_name}`
                                                        : ct.control_type_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Brand"
                                        value={data.brand}
                                        onChange={(e) => setData('brand', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Lot"
                                        value={data.lot}
                                        onChange={(e) => setData('lot', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Expired"
                                        value={data.expired}
                                        onChange={(e) => setData('expired', e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth>
                                        <InputLabel id="lt-label">Limit Type</InputLabel>
                                        <Select
                                            labelId="lt-label"
                                            label="Limit Type"
                                            value={data.limit_type}
                                            onChange={(e) => setData('limit_type', e.target.value as any)}
                                        >
                                            <MenuItem value="range">Range</MenuItem>
                                            <MenuItem value="option">Option</MenuItem>
                                            <MenuItem value="text">Text</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {data.limit_type === 'range' && (
                                    <>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="Min Value"
                                                value={data.min_value}
                                                onChange={(e) => setData('min_value', e.target.value)}
                                                required
                                                error={!!errors?.min_value}
                                                helperText={errors?.min_value}
                                                placeholder="Enter minimum value"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <TextField
                                                fullWidth
                                                label="Max Value"
                                                value={data.max_value}
                                                onChange={(e) => setData('max_value', e.target.value)}
                                                required
                                                error={!!errors?.max_value}
                                                helperText={errors?.max_value}
                                                placeholder="Enter maximum value"
                                            />
                                        </Grid>
                                    </>
                                )}

                                {data.limit_type === 'option' && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            {data.options.map((opt: string, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', gap: 1 }}>
                                                    <TextField
                                                        fullWidth
                                                        label={`Option ${idx + 1}`}
                                                        value={opt}
                                                        onChange={(e) => updateOption(idx, e.target.value)}
                                                        placeholder={`Enter option ${idx + 1}`}
                                                    />
                                                    <IconButton
                                                        aria-label="remove option"
                                                        onClick={() => removeOption(idx)}
                                                        disabled={data.options.length <= 1}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                            <Button
                                                onClick={addOption}
                                                startIcon={<AddIcon />}
                                                variant="outlined"
                                            >
                                                Add Option
                                            </Button>
                                        </Box>
                                    </Grid>
                                )}

                                {data.limit_type === 'text' && (
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Text Value"
                                            value={data.text_value}
                                            onChange={(e) => setData('text_value', e.target.value)}
                                            required
                                            error={!!errors?.text_value}
                                            helperText={errors?.text_value}
                                            placeholder="Enter text value"
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Memo"
                                        value={data.memo}
                                        onChange={(e) => setData('memo', e.target.value)}
                                        multiline
                                        minRows={3}
                                        placeholder="Enter any additional notes or comments"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 2,
                                        justifyContent: { xs: 'stretch', md: 'flex-end' },
                                        flexDirection: { xs: 'column', md: 'row' }
                                    }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => router.get(route('controls.main'))}
                                            disabled={processing}
                                            sx={{ width: { xs: '100%', md: 'auto' } }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={processing}
                                            sx={{ width: { xs: '100%', md: 'auto' } }}
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    )}
                </Paper>
            </Box>
        </DashboardLayout>
    );
}


