import axios from 'axios';
import { Candidate } from './candidateService';

const API_URL = 'http://localhost:5001/api';

// Create axios instance with default config
const adminApi = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token to all requests
adminApi.interceptors.request.use(
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
adminApi.interceptors.response.use(
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

export interface CreateCandidateDto {
    name: string;
    party: string;
    description: string;
}

export const adminService = {
    async getAllCandidates(): Promise<Candidate[]> {
        try {
            console.log('Fetching all candidates...');
            const response = await adminApi.get('/admin/candidates');
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

    async createCandidate(candidate: CreateCandidateDto): Promise<Candidate> {
        try {
            const response = await adminApi.post('/admin/candidates', candidate);
            return response.data;
        } catch (error) {
            console.error('Error creating candidate:', error);
            throw error;
        }
    },

    async updateCandidate(id: number, candidate: CreateCandidateDto): Promise<void> {
        try {
            const response = await adminApi.put(`/admin/candidates/${id}`, candidate);
            return response.data;
        } catch (error) {
            console.error('Error updating candidate:', error);
            throw error;
        }
    },

    async deactivateCandidate(id: number): Promise<void> {
        try {
            const response = await adminApi.delete(`/admin/candidates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting candidate:', error);
            throw error;
        }
    },

    async startVoting() {
        try {
            const response = await adminApi.post('/voting/start');
            return response.data;
        } catch (error) {
            console.error('Error starting voting:', error);
            throw error;
        }
    },

    async stopVoting() {
        try {
            const response = await adminApi.post('/voting/stop');
            return response.data;
        } catch (error) {
            console.error('Error stopping voting:', error);
            throw error;
        }
    },

    async getVotingStatus() {
        try {
            const response = await adminApi.get('/voting/results');
            return response.data;
        } catch (error) {
            console.error('Error getting voting status:', error);
            throw error;
        }
    }
}; 