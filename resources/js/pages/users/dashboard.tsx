import { usePage, Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Stack, Chip, Divider, TextField, Button, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';


export default function UserDashboard() {
    const { auth, assets } = usePage().props as any;

    function ControlRecordForm({ control, controlTypeId, lastRecord }: { control: any; controlTypeId: number; lastRecord?: any }) {
        const { data, setData, post, processing, reset } = useForm({ control_type_id: String(controlTypeId), record_value: '', memo: '' });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            setData('control_type_id', String(controlTypeId));
            post(route('users.records.store'), {
                onSuccess: () => {
                    reset('record_value', 'memo');
                },
            });
        };

        // Use backend-provided presentation fields; no client normalization/validation

        return (
            <Paper key={control.id} variant="outlined" sx={{ p: 2, mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Chip label={`Control: ${control.control_name}`} color="primary" />
                    {control.brand && <Chip label={`Brand: ${control.brand}`} />}
                    {control.lot && <Chip label={`Lot: ${control.lot}`} />}
                    <Chip label={`Expired: ${control.expired ? new Date(control.expired).toLocaleDateString('en-GB') : '-'}`} />
                </Box>
                {/* Last record info */}
                <Box sx={{ mt: 1, color: 'text.secondary', fontSize: 14 }}>
                    {lastRecord ? (
                        <>
                            Last record: <b>{lastRecord.record_value}</b>
                            {lastRecord.record_result ? (
                                <> (<b>{lastRecord.record_result}</b>)</>
                            ) : null}
                            {lastRecord.created_at ? (
                                <> • {new Date(lastRecord.created_at).toLocaleString()}</>
                            ) : null}
                        </>
                    ) : (
                        <>No previous record</>
                    )}
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexWrap: 'wrap', mt: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                    <Box sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }}>
                        {control.limit_type === 'range' ? (
                            <TextField
                                size="small"
                                fullWidth
                                label={control.ui_label || 'Range'}
                                type="number"
                                value={data.record_value}
                                onChange={(e) => setData('record_value', e.target.value)}
                            />
                        ) : control.limit_type === 'option' ? (
                            <FormControl fullWidth size="small">
                                <InputLabel id={`opt-label-${control.id}`}>{control.ui_label || 'Result'}</InputLabel>
                                <Select
                                    labelId={`opt-label-${control.id}`}
                                    label={control.ui_label || 'Result'}
                                    value={data.record_value || ''}
                                    onChange={(e) => setData('record_value', String(e.target.value))}
                                >
                                    <MenuItem value=""><em>Select an option</em></MenuItem>
                                    {(control.ui_options || []).map((opt: any) => {
                                        const s = String(opt);
                                        return (
                                            <MenuItem key={s} value={s}>{s}</MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                size="small"
                                fullWidth
                                label={control.ui_label || 'Result'}
                                value={data.record_value}
                                onChange={(e) => setData('record_value', e.target.value)}
                            />
                        )}
                    </Box>
                    <TextField size="small" label="Memo (optional)" value={data.memo} onChange={(e) => setData('memo', e.target.value)} sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }} />
                    <Button type="submit" variant="contained" disabled={processing} sx={{ width: { xs: '100%', md: 'auto' } }}>Submit</Button>
                </Box>
            </Paper>
        );
    }

    return (
        <DashboardLayout>
            <Head title="My Assets" />
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>My Assets</Typography>
                        <Typography variant="body1" color="text.secondary">Location: {auth.user.location || '-'}</Typography>
                    </Box>
                </Box>
                <Stack spacing={2}>
                    {(assets || []).map((a: any) => (
                        <Paper key={a.id} sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>{a.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1, flexWrap: 'wrap' }}>
                                {a.frequency && <Chip label={`Frequency: ${a.frequency}`} />}
                                {a.environment && <Chip label={`Environment: ${a.environment}`} />}
                                {a.brand && <Chip label={`Brand: ${a.brand}`} />}
                                {a.model && <Chip label={`Model: ${a.model}`} />}
                                {a.serial_number && <Chip label={`Serial: ${a.serial_number}`} />}
                                {a.memo && <Chip label={`Memo: ${a.memo}`} />}
                            </Box>
                            <Divider sx={{ my: 2 }} />

                            {(a.asset_type?.control_types || []).map((ct: any) => (
                                <Box key={ct.id} sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{ct.control_type_name}</Typography>
                                    {(ct.controls || []).map((c: any) => {
                                        const last = ct.latest_record || undefined;
                                        return (
                                            <ControlRecordForm key={c.id} control={c} controlTypeId={ct.id} lastRecord={last} />
                                        );
                                    })}
                                </Box>
                            ))}
                        </Paper>
                    ))}
                </Stack>
            </Box>
        </DashboardLayout>
    );
}


