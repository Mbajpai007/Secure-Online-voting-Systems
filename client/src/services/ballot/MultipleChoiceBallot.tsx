import React, { useState } from 'react';
import { Box, Button, Typography, Checkbox, FormControlLabel, List, ListItem } from '@mui/material';
import { IBallot, BallotType } from './IBallot';
import { Candidate } from '../candidateService';

export class MultipleChoiceBallot implements IBallot {
    public type: BallotType = BallotType.MultipleChoice;

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public candidates: Candidate[]
    ) {}

    render(): JSX.Element {
        return <MultipleChoiceBallotComponent ballot={this} />;
    }

    validate(vote: any): boolean {
        if (!Array.isArray(vote)) return false;
        return vote.every(id => this.candidates.some(c => c.id === id));
    }
}

interface MultipleChoiceBallotComponentProps {
    ballot: MultipleChoiceBallot;
}

const MultipleChoiceBallotComponent: React.FC<MultipleChoiceBallotComponentProps> = ({ ballot }) => {
    const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

    const handleCandidateToggle = (candidateId: number) => {
        setSelectedCandidates(prev => {
            if (prev.includes(candidateId)) {
                return prev.filter(id => id !== candidateId);
            } else {
                return [...prev, candidateId];
            }
        });
    };

    const handleVote = () => {
        if (ballot.validate(selectedCandidates)) {
            // Handle vote submission
            console.log('Vote submitted:', selectedCandidates);
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
                Select one or more candidates
            </Typography>
            <List>
                {ballot.candidates.map((candidate) => (
                    <ListItem key={candidate.id}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedCandidates.includes(candidate.id)}
                                    onChange={() => handleCandidateToggle(candidate.id)}
                                />
                            }
                            label={
                                <Box>
                                    <Typography>{candidate.name}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {candidate.party}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
            </List>
            <Button
                variant="contained"
                color="primary"
                onClick={handleVote}
                disabled={selectedCandidates.length === 0}
                sx={{ mt: 2 }}
            >
                Submit Vote
            </Button>
        </Box>
    );
}; 