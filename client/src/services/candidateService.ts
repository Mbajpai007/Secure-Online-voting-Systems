import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
    // Add timeout
    timeout: 5000,
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
    console.log('Starting Request:', request);
    return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(response => {
    console.log('Candidate Response:', response);
    return response; // Return the full response object
}, error => {
    console.error('Candidate Error Response:', error);
    console.error('Error Details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
    });
    return Promise.reject(error);
});

export interface Candidate {
    id: number;
    name: string;
    party: string;
    description: string;
    voteCount: number;
    isActive: boolean;
}

export const getCandidates = async (): Promise<Candidate[]> => {
    try {
        console.log('Fetching candidates...');
        const response = await api.get<Candidate[]>('/candidate');
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
};

export const getCandidateById = async (id: number): Promise<Candidate> => {
    try {
        const response = await api.get<Candidate>(`/candidate/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching candidate with ID ${id}:`, error);
        throw error;
    }
};

export const getCandidatesByParty = async (party: string): Promise<Candidate[]> => {
    try {
        const response = await api.get<Candidate[]>(`/candidate/party/${party}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching candidates for party ${party}:`, error);
        throw error;
    }
}; 