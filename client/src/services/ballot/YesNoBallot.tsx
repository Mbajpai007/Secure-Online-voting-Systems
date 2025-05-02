import React, { useState } from 'react';
import { Box, Button, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { IBallot, BallotType } from './IBallot';
import { Candidate } from '../candidateService';

export class YesNoBallot implements IBallot {
    public type: BallotType = BallotType.YesNo;

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public candidates: Candidate[]
    ) {}

    render(): JSX.Element {
        return <YesNoBallotComponent ballot={this} />;
    }

    validate(vote: any): boolean {
        return vote === 'yes' || vote === 'no';
    }
}

interface YesNoBallotComponentProps {
    ballot: YesNoBallot;
}

const YesNoBallotComponent: React.FC<YesNoBallotComponentProps> = ({ ballot }) => {
    const [selectedOption, setSelectedOption] = useState<string>('');

    const handleVote = () => {
        if (ballot.validate(selectedOption)) {
            // Handle vote submission
            console.log('Vote submitted:', selectedOption);
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
            <RadioGroup
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
            >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
            <Button
                variant="contained"
                color="primary"
                onClick={handleVote}
                disabled={!selectedOption}
                sx={{ mt: 2 }}
            >
                Submit Vote
            </Button>
        </Box>
    );
}; 