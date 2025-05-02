import { VoteService } from './VoteService';
import { IBallot } from '../ballot/IBallot';

export class VoteServiceProxy {
    private voteService: VoteService;
    private lastVoteTime: { [key: string]: number } = {};
    private readonly REVOTE_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

    constructor() {
        this.voteService = new VoteService();
    }

    async submitVote(ballot: IBallot, vote: any): Promise<boolean> {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            throw new Error('User not authenticated');
        }

        // Check rate limiting
        const now = Date.now();
        const lastVote = this.lastVoteTime[userId];
        if (lastVote && now - lastVote < this.REVOTE_WINDOW) {
            throw new Error('Please wait before submitting another vote');
        }

        // Validate vote
        if (!ballot.validate(vote)) {
            throw new Error('Invalid vote format');
        }

        try {
            const success = await this.voteService.submitVote(ballot, vote);
            if (success) {
                this.lastVoteTime[userId] = now;
            }
            return success;
        } catch (error) {
            console.error('Error submitting vote:', error);
            throw error;
        }
    }
} 