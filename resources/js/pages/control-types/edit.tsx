import { usePage, useForm, router, Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Breadcrumbs,
    Link,
    Grid,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ControlTypesEdit() {
    const { controlType, assetTypes, errors } = usePage().props as any;
    const { data, setData, post, processing } = useForm({
        asset_type_id: controlType?.asset_type_id?.toString() || '',
        control_type_name: controlType?.control_type_name || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('control-types.update', controlType.id));
    };

    const handleCancel = () => {
        router.get(route('control-types.main'));
    };

    return (
        <DashboardLayout>
            <Head title="Edit Control Type" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        color="inherit"
                        href={route('control-types.main')}
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Control Types
                    </Link>
                    <Typography color="text.primary">Edit</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                        Edit Control Type
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Update control type information
                    </Typography>
                </Box>

                {/* Form */}
                <Paper sx={{ p: { xs: 2, md: 4 } }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <FormControl fullWidth error={!!errors.asset_type_id}>
                                    <InputLabel id="asset-type-label">Asset Type</InputLabel>
                                    <Select
                                        labelId="asset-type-label"
                                        value={data.asset_type_id}
                                        label="Asset Type"
                                        onChange={(e) => setData('asset_type_id', e.target.value)}
                                        required
                                    >
                                        <MenuItem value="">
                                            <em>Select an asset type</em>
                                        </MenuItem>
                                        {assetTypes.map((assetType: any) => (
                                            <MenuItem key={assetType.id} value={assetType.id}>
                                                {assetType.asset_type_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.asset_type_id && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                                            {errors.asset_type_id}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Control Type Name"
                                    value={data.control_type_name}
                                    onChange={(e) => setData('control_type_name', e.target.value)}
                                    error={!!errors.control_type_name}
                                    helperText={errors.control_type_name}
                                    required
                                    placeholder="Enter control type name"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        Control types help organize and categorize your controls.
                                        Each control type is associated with an asset type.
                                    </Typography>
                                </Alert>
                            </Grid>

                            <Grid item xs={12}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'stretch', sm: 'center' },
                                        justifyContent: { sm: 'flex-end' },
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={handleCancel}
                                        disabled={processing}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        disabled={processing}
                                        sx={{ minWidth: { xs: 'auto', sm: 120 }, width: { xs: '100%', sm: 'auto' } }}
                                    >
                                        {processing ? 'Updating...' : 'Update Control Type'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </DashboardLayout>
    );
} 