import { usePage, Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Stack, Chip, Divider, TextField, Button, FormControl, InputLabel, Select, MenuItem, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, useMediaQuery, useTheme, Alert } from '@mui/material';
import { useState } from 'react';


export default function UserDashboard() {
    const { auth, assets } = usePage().props as any;



    function ControlRecordForm({ control, controlTypeId, lastRecord, assetId }: { control: any; controlTypeId: number; lastRecord?: any; assetId: number }) {
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

        const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
        const [pendingData, setPendingData] = useState<any>(null);

        const { data, setData, post, processing, reset } = useForm({
            asset_id: String(assetId),
            control_type_id: String(controlTypeId),
            record_value: '',
            memo: ''
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            // Store the data to be submitted
            setPendingData({
                asset_id: data.asset_id,
                control_type_id: data.control_type_id,
                record_value: data.record_value,
                memo: data.memo
            });

            // Open confirmation dialog
            setConfirmDialogOpen(true);
        };

        const handleConfirmSubmit = () => {
            if (pendingData) {
                // Update the form data with pending data
                setData('asset_id', pendingData.asset_id);
                setData('control_type_id', pendingData.control_type_id);
                setData('record_value', pendingData.record_value);
                setData('memo', pendingData.memo);

                post(route('users.records.store'), {
                    onSuccess: () => {
                        reset('record_value', 'memo');
                        setConfirmDialogOpen(false);
                        setPendingData(null);
                    },
                    onError: () => {
                        setConfirmDialogOpen(false);
                        setPendingData(null);
                    }
                });
            }
        };

        const handleCancelSubmit = () => {
            setConfirmDialogOpen(false);
            setPendingData(null);
        };

        // Calculate result for display in confirmation dialog
        const getResultDisplay = () => {
            if (!data.record_value) return 'No value entered';

            if (control.limit_type === 'range' && control.limit_value) {
                const value = parseFloat(data.record_value);
                const range = control.limit_value;
                if (!range || isNaN(value)) return 'INVALID';

                const [minStr, maxStr] = range.split(' - ');
                const min = parseFloat(minStr);
                const max = parseFloat(maxStr);

                if (isNaN(min) || isNaN(max)) return 'INVALID';
                return value >= min && value <= max ? 'PASS' : 'FAIL';
            }

            return 'Submitted';
        };

        return (
            <>
                <Paper key={control.id} variant="outlined" sx={{ p: 1.5, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                        <Chip label={`Control: ${control.control_name}`} color="primary" size="small" />
                        {control.brand && <Chip label={`Brand: ${control.brand}`} size="small" />}
                        {control.lot && <Chip label={`Lot: ${control.lot}`} size="small" />}
                        <Chip label={`Expired: ${control.expired ? new Date(control.expired).toLocaleDateString('en-GB') : '-'}`} size="small" />
                    </Box>

                    {lastRecord && (
                        <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Chip
                                    label={`Last: ${lastRecord.record_value}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                />
                                {lastRecord.record_result && (
                                    <Chip
                                        label={lastRecord.record_result}
                                        color={lastRecord.record_result === 'PASS' ? 'success' : 'error'}
                                        size="small"
                                    />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(lastRecord.created_at).toLocaleDateString('en-GB')}
                                </Typography>
                                {lastRecord.verified_by && (
                                    <Typography variant="caption" color="text.secondary">
                                        by {lastRecord.verified_by}
                                    </Typography>
                                )}
                            </Box>
                            {lastRecord.memo && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }}>
                                    {lastRecord.memo}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, alignItems: 'stretch', flexWrap: 'wrap', flexDirection: { xs: 'column', md: 'row' } }}>
                        <Box sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }}>
                            {control.limit_type === 'range' ? (
                                <Box>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        type="number"
                                        placeholder={control.limit_value || "Enter value"}
                                        value={data.record_value}
                                        onChange={(e) => setData('record_value', e.target.value)}
                                        InputProps={{
                                            endAdornment: data.record_value && control.limit_value ? (
                                                <InputAdornment position="end">
                                                    <Chip
                                                        size="small"
                                                        label={(() => {
                                                            const value = parseFloat(data.record_value);
                                                            const range = control.limit_value;
                                                            if (!range || isNaN(value)) return 'INVALID';

                                                            const [minStr, maxStr] = range.split(' - ');
                                                            const min = parseFloat(minStr);
                                                            const max = parseFloat(maxStr);

                                                            if (isNaN(min) || isNaN(max)) return 'INVALID';
                                                            return value >= min && value <= max ? 'PASS' : 'FAIL';
                                                        })()}
                                                        color={(() => {
                                                            const value = parseFloat(data.record_value);
                                                            const range = control.limit_value;
                                                            if (!range || isNaN(value)) return 'default';

                                                            const [minStr, maxStr] = range.split(' - ');
                                                            const min = parseFloat(minStr);
                                                            const max = parseFloat(maxStr);

                                                            if (isNaN(min) || isNaN(max)) return 'default';
                                                            return value >= min && value <= max ? 'success' : 'error';
                                                        })()}
                                                        sx={{ minWidth: 60, fontWeight: 'bold' }}
                                                    />
                                                </InputAdornment>
                                            ) : null
                                        }}
                                    />
                                </Box>
                            ) : control.limit_type === 'option' ? (
                                <FormControl fullWidth size="small">
                                    <Select
                                        displayEmpty
                                        value={data.record_value || ''}
                                        onChange={(e) => setData('record_value', String(e.target.value))}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em style={{ color: 'inherit', opacity: 0.6 }}>Select an option</em>;
                                            }
                                            return selected;
                                        }}
                                    >
                                        {(control.limit_options || []).map((option: string, index: number) => (
                                            <MenuItem key={index} value={option}>{option}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : (
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder={control.limit_value || "Enter result"}
                                    value={data.record_value}
                                    onChange={(e) => setData('record_value', e.target.value)}
                                />
                            )}
                        </Box>
                        <TextField size="small" placeholder="Memo (optional)" value={data.memo} onChange={(e) => setData('memo', e.target.value)} sx={{ minWidth: { xs: '100%', md: 200 }, flex: 1 }} />
                        <Button type="submit" variant="contained" disabled={processing} size="small" sx={{ width: { xs: '100%', md: 'auto' } }}>Submit</Button>
                    </Box>
                </Paper>

                {/* Confirmation Dialog */}
                <Dialog
                    open={confirmDialogOpen}
                    onClose={handleCancelSubmit}
                    fullScreen={isMobile}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                        Confirm Record Submission
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 2 }}>
                            Please review the following details before submitting your quality control record:
                        </DialogContentText>

                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                                Control Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Control:</Typography>
                                    <Typography variant="body2" fontWeight="medium">{control.control_name}</Typography>
                                </Box>
                                {control.brand && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Brand:</Typography>
                                        <Typography variant="body2">{control.brand}</Typography>
                                    </Box>
                                )}
                                {control.lot && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Lot:</Typography>
                                        <Typography variant="body2">{control.lot}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
                                Record Details
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Value:</Typography>
                                    <Typography variant="body2" fontWeight="medium">{data.record_value || 'Not provided'}</Typography>
                                </Box>
                                {control.limit_type === 'range' && control.limit_value && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">Expected Range:</Typography>
                                        <Typography variant="body2">{control.limit_value}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Result:</Typography>
                                    <Chip
                                        label={getResultDisplay()}
                                        color={getResultDisplay() === 'PASS' ? 'success' : getResultDisplay() === 'FAIL' ? 'error' : 'default'}
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </Box>
                                {data.memo && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography variant="body2" color="text.secondary">Memo:</Typography>
                                        <Typography variant="body2" sx={{ maxWidth: '60%', textAlign: 'right' }}>{data.memo}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <Alert severity="info" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            <Typography variant="body2">
                                This record will be submitted for review by an administrator.
                            </Typography>
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
                        <Button
                            onClick={handleCancelSubmit}
                            color="inherit"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmSubmit}
                            variant="contained"
                            disabled={processing}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            {processing ? 'Submitting...' : 'Confirm & Submit'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    return (
        <DashboardLayout>
            <Head title="My Assets" />
            <Box sx={{ p: { xs: 2, md: 3 } }}>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>My Assets</Typography>
                        <Typography variant="body2" color="text.secondary">Location: {auth.user.location || '-'}</Typography>
                    </Box>
                </Box>
                <Stack spacing={2}>
                    {(assets || []).map((a: any, assetIndex: number) => (
                        <Paper
                            key={assetIndex}
                            sx={{
                                p: 2,
                                border: '2px solid',
                                borderColor: `primary.${(assetIndex % 3) === 0 ? 'main' : (assetIndex % 3) === 1 ? 'light' : 'dark'}`,
                                borderRadius: 2,
                                boxShadow: 3,
                                position: 'relative',
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-2px)',
                                    transition: 'all 0.2s ease-in-out'
                                }
                            }}
                        >
                            {/* Asset Header with Background */}
                            <Box sx={{
                                bgcolor: `primary.${(assetIndex % 3) === 0 ? 'main' : (assetIndex % 3) === 1 ? 'light' : 'dark'}`,
                                color: 'white',
                                p: 1.5,
                                mb: 2,
                                borderRadius: 1,
                                mx: -2,
                                mt: -2
                            }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    {a.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                    {a.frequency && <Chip label={`Frequency: ${a.frequency}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {a.environment && <Chip label={`Environment: ${a.environment}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {a.brand && <Chip label={`Brand: ${a.brand}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {a.model && <Chip label={`Model: ${a.model}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                    {a.serial_number && <Chip label={`Serial: ${a.serial_number}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />}
                                </Box>
                            </Box>

                            {/* Asset Details */}
                            <Box sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                                mb: 2,
                                flexWrap: 'wrap',
                                p: 1,
                                bgcolor: 'background.paper',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1
                            }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    Asset Details:
                                </Typography>
                                {a.location && <Chip label={`Location: ${a.location}`} size="small" variant="outlined" />}
                                {a.frequency && <Chip label={`Frequency: ${a.frequency}`} size="small" variant="outlined" />}
                                {a.environment && <Chip label={`Environment: ${a.environment}`} size="small" variant="outlined" />}
                            </Box>

                            {(a.controls || []).map((control: any, controlIndex: number) => (
                                <Box key={controlIndex} sx={{ mb: 1.5 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 0.5,
                                        p: 1,
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1
                                    }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                            {control.type}
                                        </Typography>
                                    </Box>
                                    <ControlRecordForm
                                        control={control}
                                        controlTypeId={control.control_type_id}
                                        lastRecord={control.last_record}
                                        assetId={a.id}
                                    />
                                </Box>
                            ))}
                        </Paper>
                    ))}
                </Stack>
            </Box>
        </DashboardLayout>
    );
}


