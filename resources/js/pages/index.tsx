import { Head, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import { Grid, Card, CardContent, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Paper, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Button, Accordion, AccordionSummary, AccordionDetails, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';

export default function Index() {
    const { assets } = usePage().props as any;
    const [formData, setFormData] = useState<any>({});
    const theme = useTheme();

    // Initialize formData with default result 'PASS' for each procedure, using procedure.id
    useEffect(() => {
        if (assets) {
            const initialData: any = {};
            assets.forEach((asset: any) => {
                asset.procedures.forEach((proc: any) => {
                    const key = `${asset.id}-${proc.id}`;
                    initialData[key] = {
                        value: '',
                        result: 'PASS',
                        procedure_id: proc.id,
                    };
                });
            });
            setFormData((prev: any) => ({ ...initialData, ...prev }));
        }
    }, [assets]);

    const handleInputChange = (assetId: number, procedureId: number, field: string, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [`${assetId}-${procedureId}`]: {
                ...prev[`${assetId}-${procedureId}`],
                [field]: value,
                procedure_id: procedureId,
            },
        }));
    };

    const handleSingleSubmit = async (assetId: number, procedureId: number, e: React.FormEvent) => {
        e.preventDefault();
        const record = formData[`${assetId}-${procedureId}`];
        if (!record || !record.value || record.value.trim() === '') {
            await Swal.fire({
                icon: 'error',
                title: 'Value required',
                text: 'Please enter a value before submitting.',
            });
            return;
        }
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Submit result: ${record.result} with value: ${record.value}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit',
            cancelButtonText: 'Cancel',
        });
        if (result.isConfirmed) {
            router.post(route('record.store'), { ...record }, {
                onSuccess: () => {
                    Swal.fire({ icon: 'success', title: 'Submitted!', timer: 1200, showConfirmButton: false });
                },
                onError: () => {
                    Swal.fire({ icon: 'error', title: 'Submission failed', timer: 1500, showConfirmButton: false });
                }
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Index" />
            <Typography variant="h5" mb={2} fontWeight="bold">Assets</Typography>
            {(!assets || (Array.isArray(assets) && assets.length === 0)) ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
                    <Typography variant="body1" color="text.secondary">Don't have Asset right now</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {assets.map((asset: any) => (
                        <Grid item xs={12} key={asset.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 1, p: 1 }}>
                                <CardHeader
                                    title={<Typography variant="subtitle1" fontWeight="bold">{asset.name}</Typography>}
                                    subheader={<Typography variant="caption" color="text.secondary">Type: {asset.type}</Typography>}
                                    sx={{ color: 'primary', mb: 1, pb: 0.5, p: 1 }}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 0 }}>
                                    <Box mb={1}>
                                        <Typography variant="caption" fontWeight="bold" mb={0.5}>Asset Details</Typography>
                                        <Box display="flex" flexWrap="wrap" gap={2}>
                                            <Typography variant="caption" color="text.secondary">Loc: <b>{asset.location}</b></Typography>
                                            <Typography variant="caption" color="text.secondary">Brand: <b>{asset.brand}</b></Typography>
                                            <Typography variant="caption" color="text.secondary">Model: <b>{asset.model}</b></Typography>
                                            <Typography variant="caption" color="text.secondary">Serial: <b>{asset.serial_number}</b></Typography>
                                            <Typography variant="caption" color="text.secondary">Memo: <b>{asset.memo}</b></Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Accordion defaultExpanded sx={{ bgcolor: 'background.default', boxShadow: 0, p: 0 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`controls-content-${asset.id}`} id={`controls-header-${asset.id}`} sx={{ minHeight: 32, p: 0 }}>
                                            <Typography variant="caption" fontWeight="bold">Controls</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 0 }}>
                                            <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                                                <Table size="small" sx={{ '& th, & td': { py: 0.5, px: 1 } }}>
                                                    <TableHead>
                                                        <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : 'grey.100' }}>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>#</TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>Name</TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>Brand</TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>Lot</TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>EXP</TableCell>
                                                            <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>Memo</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {asset.procedures && asset.procedures.length > 0 ? (
                                                            asset.procedures.map((proc: any, idx: number) => (
                                                                <React.Fragment key={`${asset.id}-${proc.control?.id || idx}`}>
                                                                    <TableRow key={`main-${asset.id}-${proc.control?.id || idx}`} hover sx={{ bgcolor: theme.palette.mode === 'dark' ? (idx % 2 === 0 ? theme.palette.background.paper : theme.palette.grey[900]) : (idx % 2 === 0 ? 'grey.50' : 'background.default') }}>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{idx + 1}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{proc.control?.name || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{proc.control?.brand || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{proc.control?.lot || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{proc.control?.expired || '-'}</TableCell>
                                                                        <TableCell sx={{ fontSize: '0.8rem', color: theme.palette.text.primary }}>{proc.control?.memo || '-'}</TableCell>
                                                                    </TableRow>
                                                                    <TableRow key={`input-${asset.id}-${proc.control?.id || idx}`}>
                                                                        <TableCell></TableCell>
                                                                        <TableCell colSpan={5} sx={{ py: 0.5 }}>
                                                                            <Box display="flex" flexWrap="wrap" alignItems="center" gap={1} py={0.5}>
                                                                                <TextField
                                                                                    label="Value"
                                                                                    name={`value-${asset.id}-${proc.id}`}
                                                                                    size="small"
                                                                                    variant="outlined"
                                                                                    value={formData[`${asset.id}-${proc.id}`]?.value || ''}
                                                                                    onChange={e => handleInputChange(asset.id, proc.id, 'value', e.target.value)}
                                                                                    sx={{ minWidth: 80, mr: 1 }}
                                                                                />
                                                                                <FormControl component="fieldset" size="small" sx={{ minWidth: 100 }}>
                                                                                    <FormLabel component="legend" sx={{ fontSize: '0.8rem' }}>Result</FormLabel>
                                                                                    <RadioGroup row name={`result-${asset.id}-${proc.id}`}
                                                                                        value={formData[`${asset.id}-${proc.id}`]?.result || 'PASS'}
                                                                                        onChange={e => handleInputChange(asset.id, proc.id, 'result', e.target.value)}
                                                                                    >
                                                                                        <FormControlLabel value="PASS" control={<Radio color="success" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>PASS</span>} />
                                                                                        <FormControlLabel value="FAILED" control={<Radio color="error" size="small" />} label={<span style={{ fontSize: '0.8rem' }}>FAILED</span>} />
                                                                                    </RadioGroup>
                                                                                </FormControl>
                                                                                <form onSubmit={e => handleSingleSubmit(asset.id, proc.id, e)}>
                                                                                    <Button type="submit" variant="contained" color="primary" size="small" sx={{ borderRadius: 1, fontWeight: 600, px: 2, py: 0.5, fontSize: '0.8rem' }} aria-label={`Submit result for ${asset.name} - ${proc.control?.name || 'Control'}`}>Submit</Button>
                                                                                </form>
                                                                            </Box>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </React.Fragment>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={6} align="center" sx={{ fontSize: '0.8rem' }}>No Controls</TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </AccordionDetails>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </DashboardLayout>
    );
}
