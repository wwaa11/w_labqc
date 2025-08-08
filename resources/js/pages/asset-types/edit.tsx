import { usePage, router, Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    Alert,
    Breadcrumbs,
    Link,
} from '@mui/material';
import { useEffect } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import { useTheme } from '@mui/material/styles';

export default function AssetTypesEdit() {
    const { assetType, auth, errors } = usePage().props as any;
    const theme = useTheme();
    const { data, setData, post, processing } = useForm({
        asset_type_name: assetType?.asset_type_name || '',
    });

    // Sync form data if assetType changes
    useEffect(() => {
        if (assetType) {
            setData('asset_type_name', assetType.asset_type_name || '');
        }
    }, [assetType, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('asset-types.update', assetType.id));
    };

    const handleBack = () => {
        router.get(route('asset-types.main'));
    };

    if (!assetType) {
        return (
            <DashboardLayout>
                <Box sx={{ p: 3 }}>
                    <Typography>Loading...</Typography>
                </Box>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Edit Asset Type" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        color="inherit"
                        href={route('asset-types.main')}
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                        Asset Types
                    </Link>
                    <Typography color="text.primary">Edit</Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                        Edit Asset Type
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Update asset type information
                    </Typography>
                </Box>

                <Paper sx={{ p: { xs: 2, md: 4 } }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Asset Type Name"
                                    value={data.asset_type_name}
                                    onChange={(e) => setData('asset_type_name', e.target.value)}
                                    error={!!errors?.asset_type_name}
                                    helperText={errors?.asset_type_name || 'Enter a descriptive name for this asset type'}
                                    placeholder="e.g., Centrifuge, Microscope, Incubator"
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    <Typography variant="body2">
                                        Asset types help organize and categorize your lab assets.
                                    </Typography>
                                </Alert>
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
                                        onClick={handleBack}
                                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                                        disabled={processing}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        sx={{
                                            backgroundColor: theme.palette.primary.main,
                                            '&:hover': {
                                                backgroundColor: theme.palette.primary.dark,
                                            },
                                            minWidth: { xs: 'auto', sm: 160 },
                                            width: { xs: '100%', sm: 'auto' },
                                        }}
                                        disabled={processing}
                                    >
                                        {processing ? 'Updating...' : 'Update Asset Type'}
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