import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, ChangeEvent } from 'react';

// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Logo from '@/components/Logo';

type LoginForm = {
    userid: string;
    password: string;
};

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        userid: '',
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" px={2}>
            <Head title="Log in" />
            <Paper sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: 420 },
                p: { xs: 3, sm: 4 },
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 'none',
                mx: { xs: 1, sm: 2 }
            }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={1}>
                    <Logo className="h-6" />
                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        mt={1}
                        sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                    >
                        {(import.meta as any).env?.VITE_APP_NAME || 'Laravel'}
                    </Typography>
                </Box>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    mb={2}
                    sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
                >
                    Sign in
                </Typography>
                <form onSubmit={submit} noValidate>
                    <Box mb={2}>
                        <TextField
                            id="userid"
                            name="userid"
                            label="User ID"
                            type="text"
                            required
                            autoFocus
                            fullWidth
                            autoComplete="username"
                            value={data.userid}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('userid', e.target.value)}
                            error={!!errors.userid}
                            helperText={errors.userid}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            id="password"
                            name="password"
                            label="Password"
                            type="password"
                            required
                            fullWidth
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{
                            py: { xs: 1, sm: 1.25 },
                            fontWeight: 700,
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                        disabled={processing}
                    >
                        {processing ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>
                {status && (
                    <Alert severity="success" sx={{ mt: 2, textAlign: 'center' }}>{status}</Alert>
                )}
            </Paper>
        </Box>
    );
}
