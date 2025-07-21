import DashboardLayout from '@/layouts/dashboard';
import { Head, router } from '@inertiajs/react';
import { Box, Typography, Button } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export default function Error404() {
    return (
        <DashboardLayout>
            <Head title="404 Not Found" />
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" py={8}>
                <SentimentDissatisfiedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h1" fontWeight="bold" color="primary.main" mb={1}>
                    404
                </Typography>
                <Typography variant="h5" mb={2}>
                    Oops! Page not found.
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4}>
                    The page you are looking for does not exist or has been moved.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => router.visit(route('index'))}>
                    Go to Home
                </Button>
            </Box>
        </DashboardLayout>
    );
} 