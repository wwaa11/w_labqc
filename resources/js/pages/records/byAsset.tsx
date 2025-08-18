import { Head, router, Link, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Button, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Card, CardContent, FormControl, Select, MenuItem, Divider, Stack, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

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
    location: string;
}

interface Record {
    id: number;
    asset_type_name: string;
    location: string;
    controlType: {
        control_type_name: string;
    };
    record_value: string;
    record_result: string;
    verified_by: string;
    approved_by: string;
    status?: string;
    status_color?: string;
    memo: string;
    created_at: string;
    updated_at: string;
}

interface ActiveControl {
    id: number;
    control_name: string;
    brand: string;
    lot: string;
    expired: string;
    limit_type: string;
    memo: string;
    limit_values: string;
}

interface Statistics {
    count: string;
    mean: string;
    sd: string;
    cv: string;
    min: string;
    max: string;
}

interface RecordsByAssetProps {
    datas: {
        [key: string]: {
            control_type_id: number;
            activeControl: ActiveControl;
            limit_type: string;
            show_chart: boolean;
            show_statistics: boolean;
            records: Record[];
            statistics?: Statistics;
            chart?: any[];
            limit_value: string | null;
            limit_options: string[];
        }
    };
    asset: Asset;
    dateFrom: string;
    dateTo: string;
}

export default function RecordsByAsset({ datas, asset, dateFrom: initialDateFrom, dateTo: initialDateTo }: RecordsByAssetProps) {
    const { flash } = usePage().props as any;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'delete' | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [deleteMemo, setDeleteMemo] = useState('');
    const [expandedControl, setExpandedControl] = useState<string | false>(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Date filter state
    const [dateFrom, setDateFrom] = useState(initialDateFrom);
    const [dateTo, setDateTo] = useState(initialDateTo);



    const handleAction = (id: number, type: 'approve' | 'delete') => {
        setSelectedId(id);
        setActionType(type);
        setDeleteMemo('');
        setConfirmOpen(true);
    };

    const confirmAction = () => {
        if (actionType && selectedId) {
            if (actionType === 'approve') {
                router.post(route('records.approve', selectedId));
            } else if (actionType === 'delete') {
                setIsDeleting(true);
                const memo = deleteMemo.trim() ? `Deleted: ${deleteMemo}` : 'Deleted';
                router.delete(route('records.byAsset.destroy', { assetId: asset.id, recordId: selectedId }), {
                    data: { memo },
                    onSuccess: () => {
                        setIsDeleting(false);
                        // Success message will be shown via flash message after redirect
                    },
                    onError: (errors) => {
                        setIsDeleting(false);
                        console.error('Delete error:', errors);
                        let errorMessage = 'Failed to delete record.';
                        if (errors && typeof errors === 'object') {
                            const errorKeys = Object.keys(errors);
                            if (errorKeys.length > 0) {
                                errorMessage = `Error: ${errors[errorKeys[0]][0]}`;
                            }
                        }
                        // Error will be handled by Laravel's validation
                    }
                });
            }
        }
        setConfirmOpen(false);
        setSelectedId(null);
        setActionType(null);
        setDeleteMemo('');
    };

    const handleDeleteRecord = (recordId: number) => {
        handleAction(recordId, 'delete');
    };

    // Control Record Form Component for each control type
    function ControlRecordForm({ controlTypeName, controlTypeId, activeControl, limitValue, limitOptions }: {
        controlTypeName: string;
        controlTypeId: number;
        activeControl: ActiveControl;
        limitValue: string | null;
        limitOptions: string[];
    }) {
        const { data, setData, post, processing, reset } = useForm({
            asset_id: String(asset.id),
            control_type_id: String(controlTypeId),
            record_value: '',
            record_result: '',
            memo: '',
            created_at: new Date().toISOString().split('T')[0],
            created_time: new Date().toTimeString().split(' ')[0],
        });

        // Calculate result in real-time when record_value changes
        useEffect(() => {
            if (data.record_value && activeControl) {
                let recordResult = '';

                if (activeControl.limit_type === 'range' && limitValue) {
                    const value = parseFloat(data.record_value);
                    const [minStr, maxStr] = limitValue.split(' - ');
                    const min = parseFloat(minStr);
                    const max = parseFloat(maxStr);

                    if (!isNaN(min) && !isNaN(max) && !isNaN(value)) {
                        recordResult = value >= min && value <= max ? 'PASS' : 'FAIL';
                    }
                } else if (activeControl.limit_type === 'option') {
                    recordResult = limitOptions.includes(data.record_value) ? 'PASS' : 'FAIL';
                }

                setData('record_result', recordResult);
            }
        }, [data.record_value, activeControl, limitValue, limitOptions, setData]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            // Combine date and time into datetime format expected by backend (Y-m-d H:i)
            const combinedDateTime = `${data.created_at} ${data.created_time}`;

            // Create the data object to send
            const formData = {
                asset_id: data.asset_id,
                control_type_id: data.control_type_id,
                record_value: data.record_value,
                record_result: data.record_result,
                memo: data.memo,
                created_at: combinedDateTime
            };

            // Use router.post directly to send the data
            router.post(route('records.byAsset.store', asset.id), formData, {
                onSuccess: () => {
                    reset('record_value', 'memo', 'record_result');
                    // Success message will be shown via flash message after redirect
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    // Show specific validation errors if available
                    let errorMessage = 'Failed to create record. Please check your input.';
                    if (errors && typeof errors === 'object') {
                        const errorKeys = Object.keys(errors);
                        if (errorKeys.length > 0) {
                            errorMessage = `Validation error: ${errors[errorKeys[0]][0]}`;
                        }
                    }
                    // Error will be handled by Laravel's validation
                },
            });
        };

        if (!activeControl) return null;

        return (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={activeControl.control_name} color="primary" size="small" />
                    {activeControl.brand && <Chip label={activeControl.brand} size="small" variant="outlined" />}
                    {activeControl.lot && <Chip label={`Lot: ${activeControl.lot}`} size="small" variant="outlined" />}
                    <Chip
                        label={`Exp: ${activeControl.expired ? new Date(activeControl.expired).toLocaleDateString('en-GB') : 'N/A'}`}
                        size="small"
                        variant="outlined"
                        color={activeControl.expired && new Date(activeControl.expired) < new Date() ? 'error' : 'default'}
                    />
                </Stack>

                <Box component="form" onSubmit={handleSubmit}>
                    <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={2.5}>
                            {activeControl.limit_type === 'range' ? (
                                <TextField
                                    size="small"
                                    fullWidth
                                    type="number"
                                    placeholder={limitValue || "Enter value"}
                                    value={data.record_value}
                                    onChange={(e) => setData('record_value', e.target.value)}
                                    required
                                />
                            ) : activeControl.limit_type === 'option' ? (
                                <FormControl fullWidth size="small">
                                    <Select
                                        displayEmpty
                                        value={data.record_value || ''}
                                        onChange={(e) => setData('record_value', String(e.target.value))}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em style={{ color: 'inherit', opacity: 0.6 }}>Select option</em>;
                                            }
                                            return selected;
                                        }}
                                        required
                                    >
                                        {limitOptions.map((option: string, index: number) => (
                                            <MenuItem key={index} value={option.trim()}>{option.trim()}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder={limitValue || "Enter result"}
                                    value={data.record_value}
                                    onChange={(e) => setData('record_value', e.target.value)}
                                    required
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Memo"
                                value={data.memo}
                                onChange={(e) => setData('memo', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={1.5}>
                            <TextField
                                size="small"
                                fullWidth
                                type="date"
                                value={data.created_at}
                                onChange={(e) => setData('created_at', e.target.value)}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={1.5}>
                            <TextField
                                size="small"
                                fullWidth
                                type="time"
                                value={data.created_time}
                                onChange={(e) => setData('created_time', e.target.value)}
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={1.5}>
                            {data.record_value && data.record_result && (
                                <Chip
                                    label={data.record_result}
                                    color={data.record_result === 'PASS' ? 'success' : 'error'}
                                    size="small"
                                    sx={{ fontWeight: 'bold', width: '100%' }}
                                />
                            )}
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={processing}
                                size="small"
                                fullWidth
                                startIcon={processing ? <Box sx={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <AddIcon />}
                                sx={{
                                    '&:disabled': {
                                        bgcolor: 'primary.main',
                                        opacity: 0.7
                                    }
                                }}
                            >
                                {processing ? 'Adding...' : 'Add'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        );
    }

    const getStatusChip = (status: string, statusColor: string) => {
        return <Chip label={status} color={statusColor as any} size="small" />;
    };

    // Check if a value is numeric
    const isNumeric = (value: string): boolean => {
        return !isNaN(Number(value)) && value.trim() !== '';
    };

    // Create chart data for numeric records
    const createChartData = (records: Record[]) => {
        return records
            .filter(record => isNumeric(record.record_value))
            .map(record => ({
                date: new Date(record.created_at).toLocaleDateString(),
                value: parseFloat(record.record_value),
                result: record.record_result,
                memo: record.memo,
                verifiedBy: record.verified_by,
                approvedBy: record.approved_by,
                createdAt: record.created_at,
                recordValue: record.record_value
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    };

    // Process backend chart data
    const processBackendChartData = (backendData: any[]) => {
        return backendData.map(item => ({
            date: new Date(item.date).toLocaleDateString(),
            value: item.value,
            result: item.result,
            memo: item.memo,
            verifiedBy: item.verified_by,
            approvedBy: item.approved_by,
            createdAt: item.date,
            recordValue: item.value.toString()
        })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    // Handle date filter changes
    const handleDateChange = (newDateFrom: string, newDateTo: string) => {
        router.get(route('records.byAsset', asset.id), {
            date_from: newDateFrom,
            date_to: newDateTo
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Records for ${asset.name}`} />
            <Box sx={{ p: 1.5 }}>
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {asset.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {asset.brand} {asset.model} • {asset.location}
                        </Typography>
                    </Box>
                    <Button
                        component={Link}
                        href={route('assets.overview')}
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        size="small"
                    >
                        Back
                    </Button>
                </Stack>

                {/* Success Message */}
                {flash?.success && (
                    <Paper elevation={0} sx={{ p: 1.5, mb: 2, bgcolor: 'success.light', border: '1px solid', borderColor: 'success.main', borderRadius: 2 }}>
                        <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                            ✅ {flash.success}
                        </Typography>
                    </Paper>
                )}



                {/* Date Range Filter */}
                <Paper elevation={0} sx={{ p: 1.5, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                        <FilterListIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" fontWeight={600}>Filter Records</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                        <TextField
                            label="From Date"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateChange(e.target.value, dateTo)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ minWidth: 140 }}
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            value={dateTo}
                            onChange={(e) => handleDateChange(dateFrom, e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            sx={{ minWidth: 140 }}
                        />
                        <Button
                            variant="outlined"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                                handleDateChange(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
                            }}
                            size="small"
                        >
                            This Month
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                const now = new Date();
                                const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
                                handleDateChange(firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]);
                            }}
                            size="small"
                        >
                            Last Month
                        </Button>
                    </Stack>
                </Paper>

                {/* Records Grouped by Control Type */}
                <Stack spacing={1.5}>
                    {Object.entries(datas).map(([controlTypeName, data]) => {
                        const { records: controlRecords, activeControl, statistics: controlStatistics, chart: backendChartData, limit_value, limit_options, show_chart, show_statistics } = data;
                        const chartData = show_chart && backendChartData ? processBackendChartData(backendChartData) : createChartData(controlRecords);
                        const hasNumericData = chartData.length > 0;

                        return (
                            <Accordion
                                key={controlTypeName}
                                expanded={expandedControl === controlTypeName}
                                onChange={(event, isExpanded) => setExpandedControl(isExpanded ? controlTypeName : false)}
                                sx={{
                                    '&:before': { display: 'none' },
                                    boxShadow: 'none',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    '&.Mui-expanded': {
                                        margin: 0,
                                        marginBottom: 1.5
                                    }
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        px: 2,
                                        py: 1,
                                        '&.Mui-expanded': {
                                            minHeight: 48,
                                            '& .MuiAccordionSummary-content': {
                                                margin: '8px 0'
                                            }
                                        }
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {controlTypeName}
                                        </Typography>
                                        <Chip
                                            label={`${controlRecords.length} records`}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    {/* Add Record Form */}
                                    <Box sx={{ p: 2, pb: 1 }}>
                                        <ControlRecordForm
                                            controlTypeName={controlTypeName}
                                            controlTypeId={data.control_type_id}
                                            activeControl={activeControl}
                                            limitValue={limit_value}
                                            limitOptions={limit_options}
                                        />
                                    </Box>

                                    {/* Statistics and Control Info */}
                                    <Grid container>
                                        {/* Statistics */}
                                        {controlStatistics && (
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 1.5, borderRight: { md: 1 }, borderColor: 'divider' }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                                        <BarChartIcon color="primary" fontSize="small" />
                                                        <Typography variant="subtitle2" fontWeight={600}>Statistics</Typography>
                                                    </Stack>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">Count</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.count}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">Mean</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.mean}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">Std Dev</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.sd}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">CV (%)</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.cv}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">Min</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.min}</Typography>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={4}>
                                                            <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                                <Typography variant="caption" color="text.secondary">Max</Typography>
                                                                <Typography variant="h6" color="primary">{controlStatistics.max}</Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </Grid>
                                        )}

                                        {/* Active Control Details */}
                                        {activeControl && (
                                            <Grid item xs={12} md={6}>
                                                <Box sx={{ p: 1.5 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                                        <InfoIcon color="primary" fontSize="small" />
                                                        <Typography variant="subtitle2" fontWeight={600}>Control Details</Typography>
                                                    </Stack>
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Control</Typography>
                                                            <Typography variant="body2" fontWeight={500}>{activeControl.control_name}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Brand</Typography>
                                                            <Typography variant="body2">{activeControl.brand || 'N/A'}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Lot</Typography>
                                                            <Typography variant="body2">{activeControl.lot || 'N/A'}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Expiry</Typography>
                                                            <Typography variant="body2">
                                                                {activeControl.expired ? new Date(activeControl.expired).toLocaleDateString() : 'N/A'}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Type</Typography>
                                                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{activeControl.limit_type}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="caption" color="text.secondary">Limit</Typography>
                                                            <Typography variant="body2">{limit_value || 'N/A'}</Typography>
                                                        </Grid>
                                                        {limit_options && limit_options.length > 0 && (
                                                            <Grid item xs={12}>
                                                                <Typography variant="caption" color="text.secondary">Options</Typography>
                                                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                                                    {limit_options.map((option, index) => (
                                                                        <Chip key={index} label={option} size="small" variant="outlined" />
                                                                    ))}
                                                                </Stack>
                                                            </Grid>
                                                        )}
                                                    </Grid>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>

                                    {/* Chart for numeric data */}
                                    {hasNumericData && (
                                        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                                                <TrendingUpIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={600}>Trend Chart</Typography>
                                            </Stack>
                                            <ResponsiveContainer width="100%" height={200}>
                                                <LineChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="date"
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={50}
                                                        interval={0}
                                                    />
                                                    <YAxis />
                                                    <RechartsTooltip
                                                        formatter={(value: any, name: any, props: any) => {
                                                            const data = props.payload;
                                                            return [
                                                                <div>
                                                                    <div><strong>Value:</strong> {data.recordValue}</div>
                                                                    <div><strong>Result:</strong> {data.result || 'N/A'}</div>
                                                                    <div><strong>Verified By:</strong> {data.verifiedBy || 'N/A'}</div>
                                                                    {data.memo && <div><strong>Memo:</strong> {data.memo}</div>}
                                                                </div>,
                                                                'Record Details'
                                                            ];
                                                        }}
                                                        labelFormatter={(label) => `Date: ${label}`}
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            border: '1px solid #ccc',
                                                            borderRadius: '4px',
                                                            padding: '8px'
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#8884d8"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    )}

                                    {/* Records Table */}
                                    <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
                                        <DataGrid
                                            autoHeight
                                            rows={controlRecords.map((r: Record) => {
                                                const status = r.approved_by ? 'Approved by ' + r.approved_by : (r.verified_by ? 'Verified by ' + r.verified_by : 'Draft - Not Verified');
                                                const statusColor = r.approved_by ? 'success' : (r.verified_by ? 'warning' : 'default');

                                                return {
                                                    id: r.id,
                                                    recordValue: r.record_value,
                                                    recordResult: r.record_result || '-',
                                                    verifiedBy: r.verified_by || '-',
                                                    approvedBy: r.approved_by || '-',
                                                    status: status,
                                                    statusColor: statusColor,
                                                    memo: r.memo || '-',
                                                    createdAt: r.created_at ? new Date(r.created_at).toLocaleString() : '-',
                                                    updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleString() : '-',
                                                };
                                            })}
                                            columns={[
                                                { field: 'recordValue', headerName: 'Value', flex: 0.6, minWidth: 100 },
                                                {
                                                    field: 'recordResult',
                                                    headerName: 'Result',
                                                    flex: 0.5,
                                                    minWidth: 80,
                                                    renderCell: (params) => {
                                                        const result = params.row.recordResult;
                                                        if (result === 'PASS') {
                                                            return <Chip label="PASS" color="success" size="small" />;
                                                        } else if (result === 'FAIL') {
                                                            return <Chip label="FAIL" color="error" size="small" />;
                                                        } else {
                                                            return <span>{result}</span>;
                                                        }
                                                    }
                                                },
                                                { field: 'verifiedBy', headerName: 'Verified By', flex: 0.7, minWidth: 100 },
                                                {
                                                    field: 'approvedBy',
                                                    headerName: 'Approved By',
                                                    flex: 0.7,
                                                    minWidth: 100,
                                                    renderCell: (params) => {
                                                        const approvedBy = params.row.approvedBy;
                                                        if (approvedBy === '-') {
                                                            return <Chip label="Not Approved" color="default" size="small" variant="outlined" />;
                                                        } else {
                                                            return <Chip label={approvedBy} color="success" size="small" />;
                                                        }
                                                    }
                                                },
                                                { field: 'memo', headerName: 'Memo', flex: 1, minWidth: 120 },
                                                { field: 'createdAt', headerName: 'Created', flex: 0.7, minWidth: 120 },
                                                {
                                                    field: 'actions',
                                                    headerName: 'Actions',
                                                    width: 120,
                                                    sortable: false,
                                                    filterable: false,
                                                    renderCell: (params) => {
                                                        return (
                                                            <Stack direction="row" spacing={0.5}>
                                                                {params.row.approvedBy === '-' && (
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => handleAction(params.row.id, 'approve')}
                                                                        title="Approve Record"
                                                                    >
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleDeleteRecord(params.row.id)}
                                                                    title="Delete Record"
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        );
                                                    }
                                                }
                                            ] as GridColDef[]}
                                            pageSizeOptions={[10, 25, 50]}
                                            initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                                            disableRowSelectionOnClick
                                            disableColumnMenu
                                            hideFooterSelectedRowCount
                                            sx={{
                                                '& .MuiDataGrid-virtualScroller': { overflowX: 'hidden' },
                                                '& .MuiDataGrid-cell': { py: 0.5 },
                                                border: 'none',
                                                '& .MuiDataGrid-columnHeaders': {
                                                    backgroundColor: 'background.paper',
                                                    borderBottom: '1px solid',
                                                    borderColor: 'divider'
                                                }
                                            }}
                                        />
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Stack>

                {/* Confirmation Dialog */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>
                        {actionType === 'approve' ? 'Approve Record' : 'Delete Record'}
                    </DialogTitle>
                    <DialogContent>
                        {actionType === 'approve' && (
                            <>
                                Are you sure you want to approve this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    This will stamp the record with your approval.
                                </Typography>
                            </>
                        )}
                        {actionType === 'delete' && (
                            <>
                                Are you sure you want to delete this record?
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    This action cannot be undone. The record will be permanently removed.
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Reason for deletion (optional)"
                                    placeholder="Enter the reason for deleting this record..."
                                    value={deleteMemo}
                                    onChange={(e) => setDeleteMemo(e.target.value)}
                                    sx={{ mt: 2 }}
                                />
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            color={actionType === 'approve' ? 'success' : 'error'}
                            variant="contained"
                            onClick={confirmAction}
                            disabled={isDeleting}
                            startIcon={isDeleting ? <Box sx={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : undefined}
                        >
                            {isDeleting ? 'Deleting...' : (actionType === 'approve' ? 'Approve' : 'Delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </DashboardLayout>
    );
}
