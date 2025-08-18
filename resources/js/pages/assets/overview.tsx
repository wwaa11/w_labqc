import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Tooltip,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface Asset {
    id: number;
    name: string;
    brand: string;
    model: string;
    serial_number: string;
    frequency: string;
    environment: string;
    memo: string;
    asset_type: string;
    created_at: string;
    updated_at: string;
}

interface AssetsOverviewProps {
    assetsByLocation: Record<string, Asset[]>;
    search: string;
    totalAssets: number;
    totalLocations: number;
}

export default function AssetsOverview({ assetsByLocation, search, totalAssets, totalLocations }: AssetsOverviewProps) {
    const [searchTerm, setSearchTerm] = useState(search);
    const [expandedLocations, setExpandedLocations] = useState<string[]>(Object.keys(assetsByLocation));

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(route('assets.overview'), { search: searchTerm }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        router.get(route('assets.overview'), {}, { preserveState: true });
    };

    const handleLocationToggle = (location: string) => {
        setExpandedLocations(prev =>
            prev.includes(location)
                ? prev.filter(loc => loc !== location)
                : [...prev, location]
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <DashboardLayout>
            <Head title="Assets Overview" />

            <Box>
                {/* Header */}
                <Box mb={4}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Assets Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View all assets grouped by location with search functionality
                    </Typography>
                </Box>

                {/* Search and Stats */}
                <Box mb={4}>
                    <Grid container spacing={3}>
                        {/* Search Section */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <SearchIcon sx={{ color: 'white', fontSize: 28 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                        Search Assets
                                    </Typography>
                                </Box>
                                <form onSubmit={handleSearch}>
                                    <TextField
                                        fullWidth
                                        placeholder="Search by name, brand, model, serial number, location, or asset type..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                                },
                                                '&.Mui-focused': {
                                                    backgroundColor: 'white',
                                                },
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={handleClearSearch}
                                                        size="small"
                                                        sx={{
                                                            color: 'text.secondary',
                                                            '&:hover': { color: 'error.main' }
                                                        }}
                                                    >
                                                        <ClearIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </form>
                            </Card>
                        </Grid>

                        {/* Total Assets Stats Card */}
                        <Grid item xs={6} md={2}>
                            <Card sx={{
                                p: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'skewY(-2deg)',
                                    transformOrigin: 'top left',
                                }
                            }}>
                                <Box position="relative" zIndex={1}>
                                    <Inventory2Icon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                        {totalAssets}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Total Assets
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                        {/* Locations Stats Card */}
                        <Grid item xs={6} md={2}>
                            <Card sx={{
                                p: 3,
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    transform: 'skewY(-2deg)',
                                    transformOrigin: 'top left',
                                }
                            }}>
                                <Box position="relative" zIndex={1}>
                                    <LocationOnIcon sx={{ fontSize: 28, mb: 1, opacity: 0.9 }} />
                                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                                        {totalLocations}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                        Locations
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Assets by Location */}
                <Box>
                    {Object.keys(assetsByLocation).length === 0 ? (
                        <Card>
                            <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                <Inventory2Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No assets found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {search ? 'Try adjusting your search criteria' : 'No assets have been created yet'}
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(assetsByLocation).map(([location, assets]) => (
                            <Accordion
                                key={location}
                                expanded={expandedLocations.includes(location)}
                                onChange={() => handleLocationToggle(location)}
                                sx={{ mb: 2 }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box display="flex" alignItems="center" gap={2} width="100%">
                                        <LocationOnIcon color="primary" />
                                        <Typography variant="h6" fontWeight="bold">
                                            {location || 'Unspecified Location'}
                                        </Typography>
                                        <Chip
                                            label={`${assets.length} asset${assets.length !== 1 ? 's' : ''}`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer component={Paper} variant="outlined">
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Name</strong></TableCell>
                                                    <TableCell><strong>Asset Type</strong></TableCell>
                                                    <TableCell><strong>Brand</strong></TableCell>
                                                    <TableCell><strong>Model</strong></TableCell>
                                                    <TableCell><strong>Serial Number</strong></TableCell>
                                                    <TableCell><strong>Frequency</strong></TableCell>
                                                    <TableCell><strong>Environment</strong></TableCell>
                                                    <TableCell><strong>Actions</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {assets.map((asset) => (
                                                    <TableRow key={asset.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {asset.name}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={asset.asset_type || 'N/A'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>{asset.brand || 'N/A'}</TableCell>
                                                        <TableCell>{asset.model || 'N/A'}</TableCell>
                                                        <TableCell>{asset.serial_number || 'N/A'}</TableCell>
                                                        <TableCell>{asset.frequency || 'N/A'}</TableCell>
                                                        <TableCell>{asset.environment || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Box display="flex" gap={1}>
                                                                <Tooltip title="View Records">
                                                                    <IconButton
                                                                        component={Link}
                                                                        href={route('records.byAsset', asset.id)}
                                                                        size="small"
                                                                        color="primary"
                                                                    >
                                                                        <VisibilityIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </Box>
            </Box>
        </DashboardLayout>
    );
}
