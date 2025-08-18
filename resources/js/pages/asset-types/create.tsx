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
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTheme } from '@mui/material/styles';

export default function AssetTypesCreate() {
    const { auth, errors } = usePage().props as any;
    const theme = useTheme();
    const { data, setData, post, processing } = useForm({
        asset_type_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('asset-types.store'));
    };

    const handleBack = () => {
        router.get(route('asset-types.main'));
    };

    return (
        <DashboardLayout>
            <Head title="Create Asset Type" />

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Link
                        color="inherit"
                        href={route('asset-types.main')}
                        sx={{
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                    >
                        Asset Types
                    </Link>
                    <Typography color="text.primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        Create
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
                        }}
                    >
                        Create Asset Type
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                        Add a new asset type to organize your assets
                    </Typography>
                </Box>

                <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
                                    sx={{
                                        '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                                        '& .MuiFormHelperText-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Alert severity="info">
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                        Asset types help organize and categorize your lab assets.
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
                                        onClick={handleBack}
                                        sx={{
                                            width: { xs: '100%', sm: 'auto' },
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
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
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }}
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating...' : 'Create Asset Type'}
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