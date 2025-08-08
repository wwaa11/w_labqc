import { usePage, Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Typography, Paper, Stack, Chip, Divider, TextField, Button, FormControl, InputLabel, Select, MenuItem, InputAdornment } from '@mui/material';


export default function UserDashboard() {
    const { auth, assets } = usePage().props as any;
    const { data, setData, post, processing, reset } = useForm({ control_type_id: '', record_value: '', memo: '' });
    const submitFor = (controlTypeId: number) => (e: React.FormEvent) => {
        e.preventDefault();
        setData('control_type_id', String(controlTypeId));
        post(route('users.records.store'), { onSuccess: () => reset('record_value', 'memo') });
    };

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
                                    {(ct.controls || []).map((c: any) => (
                                        <Paper key={c.id} variant="outlined" sx={{ p: 2, mt: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                <Chip label={`Control: ${c.control_name}`} color="primary" />
                                                {c.brand && <Chip label={`Brand: ${c.brand}`} />}
                                                {c.lot && <Chip label={`Lot: ${c.lot}`} />}
                                                <Chip label={`Expired: ${c.expired ? new Date(c.expired).toLocaleDateString('en-GB') : '-'}`} />
                                            </Box>
                                            <Box component="form" onSubmit={submitFor(ct.id)} sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexWrap: 'wrap', mt: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                                                <Box sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }}>
                                                    {c.limit_type === 'range' ? (
                                                        <>
                                                            {(() => {
                                                                const lv = c.limit_values?.[0] || {};
                                                                const minStr = lv?.min_value ?? '';
                                                                const maxStr = lv?.max_value ?? '';
                                                                const min = parseFloat(minStr);
                                                                const max = parseFloat(maxStr);
                                                                const num = parseFloat(String(data.record_value));
                                                                const hasNum = !Number.isNaN(num);
                                                                const fail = hasNum && ((minStr !== '' && !Number.isNaN(min) && num < min) || (maxStr !== '' && !Number.isNaN(max) && num > max));
                                                                const labelText = `${minStr || ''} - ${maxStr || ''}`.trim();
                                                                return (
                                                                    <TextField
                                                                        size="small"
                                                                        fullWidth
                                                                        label={labelText || 'Range'}
                                                                        type="number"
                                                                        value={data.record_value}
                                                                        onChange={(e) => setData('record_value', e.target.value)}
                                                                        error={fail}
                                                                        helperText={fail ? 'Out of range' : undefined}
                                                                        InputProps={{
                                                                            endAdornment: hasNum ? (
                                                                                <InputAdornment position="end">
                                                                                    <Box sx={{ color: fail ? 'error.main' : 'success.main', fontWeight: 700 }}>
                                                                                        {fail ? 'FAIL' : 'PASS'}
                                                                                    </Box>
                                                                                </InputAdornment>
                                                                            ) : undefined,
                                                                        }}
                                                                    />
                                                                );
                                                            })()}
                                                        </>
                                                    ) : c.limit_type === 'option' ? (
                                                        <FormControl fullWidth size="small">
                                                            <InputLabel id={`opt-label-${c.id}`}>Option</InputLabel>
                                                            <Select
                                                                labelId={`opt-label-${c.id}`}
                                                                label="Option"
                                                                value={data.record_value || ''}
                                                                onChange={(e) => setData('record_value', String(e.target.value))}
                                                            >
                                                                <MenuItem value=""><em>Select an option</em></MenuItem>
                                                                {(c.limit_values || [])
                                                                    .map((v: any) => v?.option_value)
                                                                    .filter((v: any) => typeof v === 'string' && v.length > 0)
                                                                    .map((v: string) => (
                                                                        <MenuItem key={v} value={v}>{v}</MenuItem>
                                                                    ))}
                                                            </Select>
                                                        </FormControl>
                                                    ) : (
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            label="Text"
                                                            value={data.record_value}
                                                            onChange={(e) => setData('record_value', e.target.value)}
                                                        />
                                                    )}
                                                </Box>
                                                <TextField size="small" label="Memo (optional)" value={data.memo} onChange={(e) => setData('memo', e.target.value)} sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }} />
                                                <Button type="submit" variant="contained" disabled={processing} sx={{ width: { xs: '100%', md: 'auto' } }}>Submit</Button>
                                            </Box>
                                        </Paper>
                                    ))}
                                </Box>
                            ))}
                        </Paper>
                    ))}
                </Stack>
            </Box>
        </DashboardLayout>
    );
}


