import DashboardLayout from '@/layouts/dashboard';
import { Head, usePage, router } from '@inertiajs/react';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function AssetDetails({ asset }: { asset: any }) {
    return (
        <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold">{asset.name}</Typography>
            <Typography variant="body2" color="text.secondary">Type: {asset.type}</Typography>
            <Typography variant="body2" color="text.secondary">Brand: {asset.brand}</Typography>
            <Typography variant="body2" color="text.secondary">Model: {asset.model}</Typography>
            <Typography variant="body2" color="text.secondary">Serial: {asset.serial_number}</Typography>
            <Typography variant="body2" color="text.secondary">Location: {asset.location}</Typography>
            <Typography variant="body2" color="text.secondary">Memo: {asset.memo}</Typography>
        </Box>
    );
}

function ControlsTable({ procedures }: { procedures: any[] }) {
    return (
        <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Brand</TableCell>
                        <TableCell>Lot</TableCell>
                        <TableCell>Expired</TableCell>
                        <TableCell>Memo</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {procedures && procedures.length > 0 ? (
                        procedures.map((proc: any) => (
                            <TableRow key={proc.id}>
                                <TableCell>{proc.control?.name || '-'}</TableCell>
                                <TableCell>{proc.control?.brand || '-'}</TableCell>
                                <TableCell>{proc.control?.lot || '-'}</TableCell>
                                <TableCell>{proc.control?.expired || '-'}</TableCell>
                                <TableCell>{proc.control?.memo || '-'}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">No Controls</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
    if (active && payload && payload.length > 0) {
        const record = payload[0].payload;
        return (
            <Paper sx={{ p: 1 }}>
                <Typography variant="caption" fontWeight="bold">{record.created_at}</Typography><br />
                <Typography variant="body2">Value: {record.value}</Typography>
                <Typography variant="body2">Result: {record.result}</Typography>
                <Typography variant="body2">Verified by: {record.verified_by}</Typography>
            </Paper>
        );
    }
    return null;
}

function ControlChart({ proc }: { proc: any }) {
    return (
        <Box mb={4}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                {proc.control?.name || 'Control'}
            </Typography>
            {proc.records && proc.records.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={proc.records.slice(-30).map((r: any) => ({ ...r, created_at: dayjs(r.created_at).format('DD/MM HH:mm') }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="created_at" fontSize={12} angle={-30} textAnchor="end" height={60} />
                        <YAxis fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <Typography variant="body2" color="text.secondary">No records for this control.</Typography>
            )}
        </Box>
    );
}

export default function AssetView() {
    const { asset } = usePage().props as any;
    return (
        <DashboardLayout>
            <Head title={`View: ${asset.name}`} />
            <Box py={4}>
                <Button variant="text" color="primary" sx={{ mb: 2, pl: 0, minWidth: 0, fontWeight: 500 }} startIcon={<ArrowBackIcon />} onClick={() => router.visit(route('monitoring'))}>
                    Back to Monitoring
                </Button>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    Asset Information
                </Typography>
                <AssetDetails asset={asset} />
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" fontWeight="bold" mb={1}>Controls</Typography>
                <ControlsTable procedures={asset.procedures} />
                {asset.procedures && asset.procedures.length > 0 && asset.procedures.map((proc: any) => (
                    <ControlChart key={proc.id} proc={proc} />
                ))}
            </Box>
        </DashboardLayout>
    );
} 