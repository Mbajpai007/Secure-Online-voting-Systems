import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    CircularProgress,
    Snackbar,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Card,
    CardContent
} from '@mui/material';
import { Candidate } from '../services/candidateService';
import { VotingStatus } from '../services/voterService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { voterService } from '../services/voterService';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

interface ResultsData {
    candidates: Candidate[];
    totalVotes: number;
    votingStatus: VotingStatus;
}

const VotingResults: React.FC = () => {
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });
    const { user } = useAuth();

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const results = user?.role === 'admin' 
                ? await adminService.getVotingStatus()
                : await voterService.getVotingResults();
            
            setResults({
                candidates: results.candidates || [],
                totalVotes: results.totalVotes || 0,
                votingStatus: results
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Error fetching results';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const chartData = results?.candidates.map(candidate => ({
        name: candidate.name,
        votes: candidate.voteCount,
        percentage: results.totalVotes > 0 
            ? ((candidate.voteCount / results.totalVotes) * 100).toFixed(1)
            : 0
    }));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    Election Results
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : results ? (
                <>
                    {!results.votingStatus.isVotingActive ? (
                        <>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Summary
                                            </Typography>
                                            <Typography variant="body1">
                                                Total Votes Cast: {results.totalVotes}
                                            </Typography>
                                            <Typography variant="body1">
                                                Voting Period: {new Date(results.votingStatus.votingStartTime!).toLocaleString()} - {new Date(results.votingStatus.votingEndTime!).toLocaleString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Vote Distribution
                                        </Typography>
                                        <Box sx={{ height: 400 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="votes" fill="#8884d8" name="Votes" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Detailed Results
                                        </Typography>
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Candidate</TableCell>
                                                        <TableCell align="right">Votes</TableCell>
                                                        <TableCell align="right">Percentage</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {results.candidates.map((candidate) => (
                                                        <TableRow key={candidate.id}>
                                                            <TableCell>{candidate.name}</TableCell>
                                                            <TableCell align="right">{candidate.voteCount}</TableCell>
                                                            <TableCell align="right">
                                                                {results.totalVotes > 0
                                                                    ? ((candidate.voteCount / results.totalVotes) * 100).toFixed(1) + '%'
                                                                    : '0%'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    ) : (
                        <Paper sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6" color="textSecondary">
                                Results will be available after voting ends
                            </Typography>
                        </Paper>
                    )}
                </>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No results available
                    </Typography>
                </Paper>
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

export default VotingResults; 