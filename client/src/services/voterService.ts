import axios from 'axios';
import { Candidate } from './candidateService';
import { VoteValidationChain, ValidationContext } from './validation/VoteValidator';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const voterApi = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token to all requests
voterApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
voterApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface VotingStatus {
    id: number;
    isVotingActive: boolean;
    votingStartTime?: string;
    votingEndTime?: string;
    totalVotes: number;
    candidates: Candidate[];
}

export const voterService = {
    async getAllCandidates(): Promise<Candidate[]> {
        try {
            console.log('Fetching all candidates...');
            const response = await voterApi.get('/voter/candidates');
            console.log('Response data:', response.data);
            
            if (!response.data) {
                console.error('No data in response');
                return [];
            }
            
            if (!Array.isArray(response.data)) {
                console.error('Invalid response format:', response.data);
                return [];
            }
            
            return response.data;
        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            throw error;
        }
    },

    async getVotingStatus(): Promise<VotingStatus> {
        try {
            const response = await voterApi.get('/voter/voting-status');
            return response.data;
        } catch (error) {
            console.error('Error getting voting status:', error);
            throw error;
        }
    },

    async castVote(candidateId: number): Promise<{ message: string }> {
        try {
            const response = await voterApi.post('/voter/vote', { 
                candidateId,
                vote: true // Since we're voting for a candidate, vote is always true
            });
            return response.data;
        } catch (error) {
            console.error('Error casting vote:', error);
            throw error;
        }
    },

    async getVotingResults(): Promise<VotingStatus> {
        try {
            const response = await voterApi.get('/voter/results');
            return response.data;
        } catch (error) {
            console.error('Error getting voting results:', error);
            throw error;
        }
    }
}; 