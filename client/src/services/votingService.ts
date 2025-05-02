import axios from 'axios';
import { Candidate } from './candidateService';

// Use the same axios instance as authService
const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,
});

// Add auth token to all requests
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface VotingStatus {
    id: number;
    isVotingActive: boolean;
    votingStartTime: string | null;
    votingEndTime: string | null;
    totalVotes: number;
    candidates: Candidate[];
}

export interface VoteResponse {
    success: boolean;
    message: string;
}

export const startVoting = async (): Promise<void> => {
    try {
        await api.post('/voting/start');
    } catch (error) {
        console.error('Error starting voting:', error);
        throw error;
    }
};

export const stopVoting = async (): Promise<void> => {
    try {
        await api.post('/voting/stop');
    } catch (error) {
        console.error('Error stopping voting:', error);
        throw error;
    }
};

export const getVotingStatus = async (): Promise<VotingStatus> => {
    try {
        const response = await api.get<VotingStatus>('/voting/status');
        return response.data;
    } catch (error) {
        console.error('Error getting voting status:', error);
        throw error;
    }
};

export const castVote = async (candidateId: number): Promise<VoteResponse> => {
    try {
        const response = await api.post<VoteResponse>('/voting/vote', { candidateId });
        return response.data;
    } catch (error) {
        console.error('Error casting vote:', error);
        throw error;
    }
}; 