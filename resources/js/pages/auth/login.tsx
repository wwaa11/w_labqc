import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, ChangeEvent } from 'react';

// Material UI imports
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';

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
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" px={2}>
            <Head title="Log in" />
            <Paper elevation={6} sx={{ width: '100%', maxWidth: 400, p: 4, borderRadius: 3 }}>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    <Logo className="h-12 mb-2" />
                    <Typography variant="h5" fontWeight={600} mb={0.5} color="primary.main">
                        PR9 LAB Assets
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Log in to your account
                    </Typography>
                </Box>
                <form onSubmit={submit} noValidate>
                    <Box mb={2}>
                        <TextField
                            id="userid"
                            name="userid"
                            label="รหัสพนักงาน"
                            type="text"
                            required
                            autoFocus
                            fullWidth
                            autoComplete="username"
                            value={data.userid}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setData('userid', e.target.value)}
                            placeholder="รหัสพนักงาน"
                            error={!!errors.userid}
                            helperText={errors.userid}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
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
                            placeholder="Password"
                            error={!!errors.password}
                            helperText={errors.password}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        sx={{ py: 1.5, fontWeight: 600, fontSize: '1rem', mb: 1 }}
                        disabled={processing}
                        startIcon={processing ? <LoaderCircle className="animate-spin" /> : null}
                    >
                        LOGIN
                    </Button>
                </form>
                {status && (
                    <Alert severity="success" sx={{ mt: 2, textAlign: 'center' }}>{status}</Alert>
                )}
            </Paper>
        </Box>
    );
}
