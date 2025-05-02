import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Paper
} from '@mui/material';
import { Candidate } from '../services/candidateService';
import { voterService, VotingStatus } from '../services/voterService';

const VoterDashboard: React.FC = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    useEffect(() => {
        fetchCandidates();
        fetchVotingStatus();
    }, []);

    const fetchVotingStatus = async () => {
        try {
            const status = await voterService.getVotingStatus();
            setVotingStatus(status);
        } catch (error) {
            console.error('Error fetching voting status:', error);
            setSnackbar({
                open: true,
                message: 'Error fetching voting status',
                severity: 'error'
            });
        }
    };

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const data = await voterService.getAllCandidates();
            console.log('Fetched candidates:', data);
            if (Array.isArray(data)) {
                setCandidates(data);
            } else {
                console.error('Invalid candidates data:', data);
                setSnackbar({
                    open: true,
                    message: 'Invalid candidates data received',
                    severity: 'error'
                });
            }
        } catch (error: any) {
            console.error('Error fetching candidates:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Error fetching candidates',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (candidateId: number) => {
        try {
            if (hasVoted) {
                setSnackbar({
                    open: true,
                    message: 'You have already cast your vote',
                    severity: 'error'
                });
                return;
            }

            setSelectedCandidate(candidateId);
            const response = await voterService.castVote(candidateId);
            setHasVoted(true);
            setSnackbar({
                open: true,
                message: response.message,
                severity: 'success'
            });
            fetchCandidates(); // Refresh candidate list to update vote counts
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Error casting vote';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Voter Dashboard
                </Typography>
            </Box>

            {votingStatus && (
                <Paper sx={{ p: 2, mb: 4, bgcolor: votingStatus.isVotingActive ? 'success.light' : 'error.light' }}>
                    <Typography variant="h6" color="white">
                        Voting Status: {votingStatus.isVotingActive ? 'Active' : 'Inactive'}
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
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                fullWidth
                                                onClick={() => handleVote(candidate.id)}
                                                disabled={
                                                    !votingStatus?.isVotingActive ||
                                                    hasVoted ||
                                                    selectedCandidate === candidate.id
                                                }
                                            >
                                                {selectedCandidate === candidate.id ? 'Voted' : 'Vote'}
                                            </Button>
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

export default VoterDashboard; 