import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Paper,
    Divider,
    Alert,
    Button,
    Stepper,
    Step,
    StepLabel,
    StepContent,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Help as HelpIcon,
    Dashboard as DashboardIcon,
    Inventory2 as InventoryIcon,
    Science as ScienceIcon,
    Assessment as AssessmentIcon,
    AdminPanelSettings as AdminIcon,
    Category as CategoryIcon,
    Tune as TuneIcon,
    LocationOn as LocationIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';

const UserGuide: React.FC = () => {
    const [expanded, setExpanded] = useState<string | false>('panel1');

    const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const quickStartSteps = [
        {
            label: 'Login to Your Account',
            description: 'Use your provided credentials to access the system. Contact your administrator if you need login details.',
            icon: <PersonIcon />
        },
        {
            label: 'Navigate the Dashboard',
            description: 'Use the sidebar navigation to access different sections based on your role and permissions.',
            icon: <DashboardIcon />
        },
        {
            label: 'View Your Assets',
            description: 'Check the assets assigned to your location and their current status.',
            icon: <InventoryIcon />
        },
        {
            label: 'Submit Records',
            description: 'Enter quality control records for your assigned assets and controls.',
            icon: <AssessmentIcon />
        }
    ];

    const roleFeatures = [
        {
            role: 'Regular User',
            icon: <PersonIcon />,
            color: 'primary',
            features: [
                'View assets at your assigned location',
                'Submit quality control records',
                'Access basic reporting'
            ]
        },
        {
            role: 'Admin',
            icon: <AdminIcon />,
            color: 'secondary',
            features: [
                'All regular user features',
                'Manage assets and controls',
                'Approve/reject quality control records',
                'Manage user roles and locations',
                'Access comprehensive reporting',
                'View assets overview across all locations'
            ]
        }
    ];

    const featureGuides = [
        {
            title: 'Asset Management',
            icon: <InventoryIcon />,
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Managing Assets</Typography>
                    <Typography paragraph>
                        Assets are the equipment and instruments that require quality control monitoring.
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>For Admins:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Navigate to Assets Management to view all assets" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Use the Create button to add new assets" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Edit existing assets by clicking the edit icon" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Set asset location, frequency, and other details" />
                        </ListItem>
                    </List>

                    <Typography variant="subtitle1" gutterBottom>For Users:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="View assets assigned to your location" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Check asset details and control requirements" />
                        </ListItem>
                    </List>
                </Box>
            )
        },
        {
            title: 'Quality Control Records',
            icon: <AssessmentIcon />,
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Submitting Quality Control Records</Typography>
                    <Typography paragraph>
                        Quality control records track the performance and calibration of your assets.
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>Submitting Records:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Select an asset from your dashboard" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Choose the appropriate control for testing" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Enter your test results and observations" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Submit the record for review" />
                        </ListItem>
                    </List>

                    <Typography variant="subtitle1" gutterBottom>For Admins - Reviewing Records:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Navigate to Approve Records section" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Review submitted records for accuracy" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Approve valid records or reject with comments" />
                        </ListItem>
                    </List>
                </Box>
            )
        },
        {
            title: 'User Management',
            icon: <AdminIcon />,
            content: (
                <Box>
                    <Typography variant="h6" gutterBottom>Managing Users and Roles</Typography>
                    <Typography paragraph>
                        Admins can manage user accounts, assign roles, and control access permissions.
                    </Typography>

                    <Typography variant="subtitle1" gutterBottom>User Management:</Typography>
                    <List dense>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Navigate to Roles & Location section" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="View all users and their current roles" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Assign users to specific locations" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Change user roles (User, Admin)" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CheckCircleIcon color="primary" /></ListItemIcon>
                            <ListItemText primary="Bulk assign locations to multiple users" />
                        </ListItem>
                    </List>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>Note:</strong> Contact your system administrator for new user setup.
                        </Typography>
                    </Alert>
                </Box>
            )
        }
    ];

    const troubleshootingTips = [
        {
            issue: "Can't access certain features",
            solution: "Check your user role and permissions. Contact your administrator if you need access to additional features."
        },
        {
            issue: "Assets not showing up",
            solution: "Verify your assigned location. Assets are filtered by your location setting."
        },
        {
            issue: "Can't submit records",
            solution: "Ensure you have active controls assigned to your assets. Check with your admin if controls are missing."
        },
        {
            issue: "System appears slow",
            solution: "Try refreshing the page. Clear your browser cache if issues persist."
        }
    ];

    return (
        <DashboardLayout>
            <Head title="User Guide - How to Use the System" />

            <Box>
                <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
                >
                    User Guide
                </Typography>
                <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    paragraph
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    Learn how to effectively use the Laboratory Quality Control System
                </Typography>

                {/* Quick Start Section */}
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            <HelpIcon color="primary" />
                            Quick Start Guide
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Follow these steps to get started with the system:
                        </Typography>

                        <Stepper orientation="vertical">
                            {quickStartSteps.map((step, index) => (
                                <Step key={index} active={true}>
                                    <StepLabel
                                        icon={step.icon}
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                fontSize: { xs: '0.875rem', sm: '1rem' }
                                            }
                                        }}
                                    >
                                        {step.label}
                                    </StepLabel>
                                    <StepContent>
                                        <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                            {step.description}
                                        </Typography>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>

                {/* Role-Based Features */}
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                        >
                            Features by User Role
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Different user roles have access to different features:
                        </Typography>

                        <Grid container spacing={2}>
                            {roleFeatures.map((role, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, height: '100%' }}>
                                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                                            <Box color={`${role.color}.main`}>
                                                {role.icon}
                                            </Box>
                                            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                                {role.role}
                                            </Typography>
                                        </Box>
                                        <List dense sx={{ py: 0 }}>
                                            {role.features.map((feature, featureIndex) => (
                                                <ListItem key={featureIndex} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                                        <CheckCircleIcon fontSize="small" color="primary" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={feature}
                                                        primaryTypographyProps={{
                                                            variant: 'body2',
                                                            sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Detailed Feature Guides */}
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                        >
                            Detailed Feature Guides
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Learn how to use specific features of the system:
                        </Typography>

                        {featureGuides.map((guide, index) => (
                            <Accordion
                                key={index}
                                expanded={expanded === `panel${index + 1}`}
                                onChange={handleChange(`panel${index + 1}`)}
                                sx={{ mb: 1 }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        '& .MuiAccordionSummary-content': {
                                            fontSize: { xs: '0.875rem', sm: '1rem' }
                                        }
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {guide.icon}
                                        <Typography
                                            variant="h6"
                                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                                        >
                                            {guide.title}
                                        </Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    {guide.content}
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </CardContent>
                </Card>

                {/* Navigation Guide */}
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                        >
                            Navigation Guide
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Understanding the sidebar navigation:
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        User Navigation Items:
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <DashboardIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="My Assets"
                                                secondary="View assets at your location"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                                        Admin Navigation Items:
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <AssessmentIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Approve Records"
                                                secondary="Review and approve quality control records (Admin only)"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <LocationIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Assets Overview"
                                                secondary="Visual overview of all assets (Admin only)"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <InventoryIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Assets Management"
                                                secondary="Manage assets (Admin only)"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <ScienceIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Controls Management"
                                                secondary="Manage quality controls (Admin only)"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0.5, px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                                <AdminIcon color="primary" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Roles & Location"
                                                secondary="Manage users and permissions (Admin only)"
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    sx: { fontSize: { xs: '0.875rem', sm: '0.875rem' } }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: { fontSize: { xs: '0.75rem', sm: '0.75rem' } }
                                                }}
                                            />
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Troubleshooting */}
                <Card elevation={2} sx={{ mb: 4, borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: { xs: '1.25rem', sm: '1.5rem' }
                            }}
                        >
                            <WarningIcon color="warning" />
                            Troubleshooting
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            Common issues and their solutions:
                        </Typography>

                        <Grid container spacing={2}>
                            {troubleshootingTips.map((tip, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            gutterBottom
                                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                        >
                                            {tip.issue}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            {tip.solution}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>

                {/* Support Information */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Typography
                            variant="h5"
                            gutterBottom
                            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
                        >
                            Need Help?
                        </Typography>
                        <Typography
                            paragraph
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                        >
                            If you need additional assistance:
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                                <strong>Contact your system administrator</strong> for technical support,
                                account issues, or feature requests.
                            </Typography>
                        </Alert>

                        <Alert severity="success">
                            <Typography
                                variant="body2"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                            >
                                <strong>Training:</strong> New users should receive training from their
                                supervisor or administrator before using the system.
                            </Typography>
                        </Alert>
                    </CardContent>
                </Card>
            </Box>
        </DashboardLayout>
    );
};

export default UserGuide;
