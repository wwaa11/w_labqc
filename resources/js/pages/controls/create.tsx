import { useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function ControlsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        limit: '',
        brand: '',
        lot: '',
        expired: '',
        memo: '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setData(e.target.name as keyof typeof data, e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('controls.store'));
    };

    return (
        <DashboardLayout>
            <Typography variant="h5" mb={3} fontWeight="bold">
                Create Control
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Name"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Limit"
                            name="limit"
                            value={data.limit}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.limit}
                            helperText={errors.limit}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Brand"
                            name="brand"
                            value={data.brand}
                            onChange={handleChange}
                            fullWidth
                            error={!!errors.brand}
                            helperText={errors.brand}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Lot"
                            name="lot"
                            value={data.lot}
                            onChange={handleChange}
                            fullWidth
                            error={!!errors.lot}
                            helperText={errors.lot}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Expired"
                            name="expired"
                            type="date"
                            value={data.expired}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!errors.expired}
                            helperText={errors.expired}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Memo"
                            name="memo"
                            value={data.memo}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            minRows={2}
                            error={!!errors.memo}
                            helperText={errors.memo}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={processing}
                            fullWidth
                            sx={{ py: 1.5 }}
                        >
                            Create Control
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
