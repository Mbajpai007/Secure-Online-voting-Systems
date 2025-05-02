import { IBallot } from '../ballot/IBallot';
import axios from 'axios';

export class VoteService {
    private api = axios.create({
        baseURL: 'http://localhost:5001/api',
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 5000,
    });

    constructor() {
        // Add auth token to all requests
        this.api.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async submitVote(ballot: IBallot, vote: any): Promise<boolean> {
        try {
            const response = await this.api.post('/voting/vote', {
                ballotId: ballot.id,
                vote,
                type: ballot.type
            });
            return response.data.success;
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    }
} 