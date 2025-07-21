import DashboardLayout from '@/layouts/dashboard';
import { Head, router } from '@inertiajs/react';
import { Box, Typography, Button } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

export default function Error500() {
    return (
        <DashboardLayout>
            <Head title="500 Internal Server Error" />
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" py={8}>
                <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                <Typography variant="h1" fontWeight="bold" color="error.main" mb={1}>
                    500
                </Typography>
                <Typography variant="h5" mb={2}>
                    Oops! Something went wrong.
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    An unexpected error occurred. Please try again later or contact support.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => router.visit(route('index'))}>
                    Go to Home
                </Button>
            </Box>
        </DashboardLayout>
    );
} 