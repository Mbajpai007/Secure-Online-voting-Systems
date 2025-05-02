import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    TextField,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Paper
} from '@mui/material';
import * as Icons from '@mui/icons-material';
import { Candidate } from '../services/candidateService';
import { CreateCandidateDto, adminService } from '../services/adminService';
import { VotingStatus } from '../services/votingService';
import { BallotFactory } from '../services/ballot/BallotFactory';
import { BallotType } from '../services/ballot/IBallot';
import { NotificationService, ElectionEvent } from '../services/notifications/NotificationService';
import { VoteValidationChain } from '../services/validation/VoteValidator';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [formData, setFormData] = useState<CreateCandidateDto>({
        name: '',
        party: '',
        description: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
    const [isVotingActive, setIsVotingActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || user?.roles?.includes('admin') === false) {
            navigate('/login');
            return;
        }
        fetchCandidates();
        fetchVotingStatus();
    }, [isAuthenticated, user, navigate]);

    const fetchVotingStatus = async () => {
        try {
            const status = await adminService.getVotingStatus();
            setVotingStatus(status);
            setIsVotingActive(status.isVotingActive);
            setError(null);
        } catch (err) {
            setError('Failed to fetch voting status');
            console.error('Error fetching voting status:', err);
        }
    };

    const handleStartVoting = async () => {
        try {
            await adminService.startVoting();
            setIsVotingActive(true);
            setError(null);
        } catch (err) {
            setError('Failed to start voting');
            console.error('Error starting voting:', err);
        }
    };

    const handleStopVoting = async () => {
        try {
            await adminService.stopVoting();
            setIsVotingActive(false);
            setError(null);
        } catch (err) {
            setError('Failed to stop voting');
            console.error('Error stopping voting:', err);
        }
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllCandidates();
            console.log('Fetched candidates:', data);
            if (Array.isArray(data)) {
                setCandidates(data);
            } else {
                console.error('Invalid candidates data:', data);
                setCandidates([]);
                setSnackbar({
                    open: true,
                    message: 'Invalid candidates data received',
                    severity: 'error'
                });
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch candidates');
            console.error('Error fetching candidates:', err);
            setCandidates([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (candidate?: Candidate) => {
        if (candidate) {
            setEditingCandidate(candidate);
            setFormData({
                name: candidate.name,
                party: candidate.party,
                description: candidate.description
            });
        } else {
            setEditingCandidate(null);
            setFormData({
                name: '',
                party: '',
                description: ''
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingCandidate(null);
        setFormData({
            name: '',
            party: '',
            description: ''
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingCandidate) {
                await adminService.updateCandidate(editingCandidate.id, formData);
                setSnackbar({
                    open: true,
                    message: 'Candidate updated successfully',
                    severity: 'success'
                });
            } else {
                await adminService.createCandidate(formData);
                setSnackbar({
                    open: true,
                    message: 'Candidate created successfully',
                    severity: 'success'
                });
            }
            handleCloseDialog();
            fetchCandidates();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Error saving candidate';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await adminService.deactivateCandidate(id);
            setSnackbar({
                open: true,
                message: 'Candidate deactivated successfully',
                severity: 'success'
            });
            fetchCandidates();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Error deactivating candidate';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const ballot = BallotFactory.createBallot(
        BallotType.RankedChoice,
        1,
        "Election 2024",
        "Select your preferred candidates",
        candidates
    );

    const notificationService = NotificationService.getInstance();
    notificationService.subscribe({
        update(event: ElectionEvent) {
            // Handle notification
        }
    });

    if (!isAuthenticated || user?.roles?.includes('admin') === false) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Admin Dashboard
                </Typography>
                <Box>
                    {isVotingActive ? (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Icons.Stop />}
                            onClick={handleStopVoting}
                            sx={{ mr: 2 }}
                        >
                            Stop Voting
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Icons.PlayArrow />}
                            onClick={handleStartVoting}
                            sx={{ mr: 2 }}
                        >
                            Start Voting
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDialog()}
                        disabled={isVotingActive}
                    >
                        Add Candidate
                    </Button>
                </Box>
            </Box>

            {votingStatus && (
                <Paper sx={{ p: 2, mb: 4, bgcolor: isVotingActive ? 'success.light' : 'error.light' }}>
                    <Typography variant="h6" color="white">
                        Voting Status: {isVotingActive ? 'Active' : 'Inactive'}
                    </Typography>
                    {votingStatus.votingStartTime && (
                        <Typography variant="body2" color="white">
                            Started: {new Date(votingStatus.votingStartTime).toLocaleString()}
                        </Typography>
                    )}
                    {votingStatus.votingEndTime && (
                        <Typography variant="body2" color="white">
                            Ended: {new Date(votingStatus.votingEndTime).toLocaleString()}
                        </Typography>
                    )}
                </Paper>
            )}

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {candidates && candidates.length > 0 ? (
                        candidates.map((candidate) => (
                            <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h5" component="h2">
                                            {candidate.name}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                            {candidate.party}
                                        </Typography>
                                        <Typography variant="body2" component="p">
                                            {candidate.description}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Votes: {candidate.voteCount}
                                        </Typography>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleOpenDialog(candidate)}
                                                disabled={isVotingActive}
                                            >
                                                <Icons.Edit />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(candidate.id)}
                                                disabled={isVotingActive}
                                            >
                                                <Icons.Delete />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="h6" align="center" color="textSecondary">
                                No candidates found
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Party"
                        fullWidth
                        value={formData.party}
                        onChange={(e) => setFormData({ ...formData, party: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingCandidate ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminDashboard; 