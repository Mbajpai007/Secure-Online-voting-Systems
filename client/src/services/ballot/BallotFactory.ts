import { IBallot, BallotType } from './IBallot';
import { YesNoBallot } from './YesNoBallot';
import { RankedChoiceBallot } from './RankedChoiceBallot';
import { MultipleChoiceBallot } from './MultipleChoiceBallot';
import { Candidate } from '../candidateService';

export class BallotFactory {
    static createBallot(
        type: BallotType,
        id: number,
        title: string,
        description: string,
        candidates: Candidate[]
    ): IBallot {
        switch (type) {
            case BallotType.YesNo:
                return new YesNoBallot(id, title, description, candidates);
            case BallotType.RankedChoice:
                return new RankedChoiceBallot(id, title, description, candidates);
            case BallotType.MultipleChoice:
                return new MultipleChoiceBallot(id, title, description, candidates);
            default:
                throw new Error(`Unsupported ballot type: ${type}`);
        }
    }
} 