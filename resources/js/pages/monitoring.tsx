import DashboardLayout from '@/layouts/dashboard';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, Button, Chip } from '@mui/material';
import { usePage, router, Head } from '@inertiajs/react';
import dayjs from 'dayjs';
import React from 'react'; // Added missing import
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function Monitoring() {
    const { locations } = usePage().props as any;
    const handleView = (assetId: number) => {
        router.visit(route('assets.view', assetId));
    };
    return (
        <DashboardLayout>
            <Head title="Monitoring" />
            <Box py={4}>
                <Typography variant="h4" fontWeight="bold" mb={2}>
                    Monitoring
                </Typography>
                {locations && locations.length > 0 ? (
                    locations.map((group: any) => (
                        <Box key={group.location} mb={4}>
                            <Typography variant="h6" fontWeight="bold" mb={1} color="primary.main">
                                Location: {group.location || 'Unknown'}
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Brand</TableCell>
                                            <TableCell>Lot</TableCell>
                                            <TableCell>Expired</TableCell>
                                            <TableCell>Memo</TableCell>
                                            <TableCell>Last Record</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {group.assets.map((asset: any) => {
                                            // Find the latest record from all procedures
                                            let lastRecord: any = null;
                                            asset.procedures?.forEach((proc: any) => {
                                                if (proc.last_record) {
                                                    if (!lastRecord || dayjs(proc.last_record.created_at).isAfter(dayjs(lastRecord.created_at))) {
                                                        lastRecord = proc.last_record;
                                                    }
                                                }
                                            });
                                            return (
                                                <React.Fragment key={asset.id}>
                                                    {/* Asset detail row */}
                                                    <TableRow sx={{ cursor: 'pointer', transition: 'background 0.2s', '&:hover': { bgcolor: 'action.hover' } }}>
                                                        <TableCell colSpan={8}>
                                                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                                                <Box>
                                                                    <Typography variant="subtitle2" fontWeight="bold">{asset.name}</Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>Type: {asset.type}</Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>Brand: {asset.brand}</Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>Model: {asset.model}</Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>Serial: {asset.serial_number}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">Memo: {asset.memo}</Typography>
                                                                </Box>
                                                                <Button variant="outlined" size="small" onClick={() => handleView(asset.id)}>
                                                                    View
                                                                </Button>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                    {/* Procedure rows */}
                                                    {asset.procedures && asset.procedures.length > 0 ? (
                                                        asset.procedures.map((proc: any) => {
                                                            const lastRecordDate = proc.last_record ? dayjs(proc.last_record.created_at) : null;
                                                            const isToday = lastRecordDate && lastRecordDate.isSame(dayjs(), 'day');
                                                            return (
                                                                <TableRow key={proc.id}>
                                                                    <TableCell>{proc.control?.name || '-'}</TableCell>
                                                                    <TableCell>{proc.control?.brand || '-'}</TableCell>
                                                                    <TableCell>{proc.control?.lot || '-'}</TableCell>
                                                                    <TableCell>{proc.control?.expired || '-'}</TableCell>
                                                                    <TableCell>{proc.control?.memo || '-'}</TableCell>
                                                                    <TableCell>
                                                                        {proc.last_record ? (
                                                                            <>
                                                                                <Chip label={proc.last_record.result} size="small" color={proc.last_record.result === 'PASS' ? 'success' : 'error'} sx={{ fontSize: '0.8rem', fontStyle: 'italic', mx: 0.5 }} />
                                                                                <span style={{ fontWeight: 500 }}>{proc.last_record.value}</span>{' '}
                                                                                <span style={{ color: '#888', fontSize: '0.8rem' }}>{dayjs(proc.last_record.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                                                                {isToday ? (
                                                                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                                                                                ) : (
                                                                                    <CancelIcon sx={{ color: 'error.main', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <CancelIcon sx={{ color: 'error.main', fontSize: 18, ml: 1, verticalAlign: 'middle' }} />
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell></TableCell>
                                                                </TableRow>
                                                            );
                                                        })
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell colSpan={8} align="center" sx={{ color: '#aaa', fontSize: '0.8rem' }}>No procedures</TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Divider sx={{ my: 2 }} />
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No assets found.
                    </Typography>
                )}
            </Box>
        </DashboardLayout>
    );
} 