import DashboardLayout from '@/layouts/dashboard';
import { usePage, router } from '@inertiajs/react';
import { Box, Typography, TextField, Button, Paper, Grid } from '@mui/material';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function ControlEdit() {
    const { control } = usePage().props as any;
    const [form, setForm] = useState({
        name: control.name || '',
        limit: control.limit || '',
        brand: control.brand || '',
        lot: control.lot || '',
        expired: control.expired ? dayjs(control.expired).format('YYYY-MM-DD') : '',
        memo: control.memo || '',
    });
    const [processing, setProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('controls.update', control.id), form, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <DashboardLayout>
            <Box py={4}>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    Edit Control
                </Typography>
                <Paper sx={{ maxWidth: 500, mx: 'auto', p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Limit"
                                    name="limit"
                                    value={form.limit}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Brand"
                                    name="brand"
                                    value={form.brand}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Lot"
                                    name="lot"
                                    value={form.lot}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Expired"
                                    name="expired"
                                    type="date"
                                    value={form.expired}
                                    onChange={handleChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Memo"
                                    name="memo"
                                    value={form.memo}
                                    onChange={handleChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                                <Button variant="outlined" color="secondary" onClick={() => router.visit(route('controls.main'))}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained" color="primary" disabled={processing}>
                                    Save
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </DashboardLayout>
    );
} 