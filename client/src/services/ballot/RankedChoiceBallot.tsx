import React, { useState } from 'react';
import { Box, Button, Typography, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { IBallot, BallotType } from './IBallot';
import { Candidate } from '../candidateService';

export class RankedChoiceBallot implements IBallot {
    public type: BallotType = BallotType.RankedChoice;

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public candidates: Candidate[]
    ) {}

    render(): JSX.Element {
        return <RankedChoiceBallotComponent ballot={this} />;
    }

    validate(vote: any): boolean {
        if (!Array.isArray(vote)) return false;
        if (vote.length !== this.candidates.length) return false;
        
        // Check if all candidates are ranked exactly once
        const ranks = new Set(vote.map(v => v.rank));
        return ranks.size === this.candidates.length && 
               Math.min(...ranks) === 1 && 
               Math.max(...ranks) === this.candidates.length;
    }
}

interface RankedChoiceBallotComponentProps {
    ballot: RankedChoiceBallot;
}

const RankedChoiceBallotComponent: React.FC<RankedChoiceBallotComponentProps> = ({ ballot }) => {
    const [rankings, setRankings] = useState<{ [key: number]: number }>({});

    const handleRankChange = (candidateId: number, rank: number) => {
        setRankings(prev => ({
            ...prev,
            [candidateId]: rank
        }));
    };

    const handleVote = () => {
        const vote = Object.entries(rankings).map(([candidateId, rank]) => ({
            candidateId: parseInt(candidateId),
            rank
        }));

        if (ballot.validate(vote)) {
            // Handle vote submission
            console.log('Vote submitted:', vote);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                {ballot.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
                {ballot.description}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
                Rank candidates from 1 (highest) to {ballot.candidates.length} (lowest)
            </Typography>
            <List>
                {ballot.candidates.map((candidate) => (
                    <ListItem key={candidate.id}>
                        <ListItemText
                            primary={candidate.name}
                            secondary={candidate.party}
                        />
                        <ListItemSecondaryAction>
                            <input
                                type="number"
                                min="1"
                                max={ballot.candidates.length}
                                value={rankings[candidate.id] || ''}
                                onChange={(e) => handleRankChange(candidate.id, parseInt(e.target.value))}
                                style={{ width: '50px' }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
            <Button
                variant="contained"
                color="primary"
                onClick={handleVote}
                disabled={Object.keys(rankings).length !== ballot.candidates.length}
                sx={{ mt: 2 }}
            >
                Submit Vote
            </Button>
        </Box>
    );
}; 