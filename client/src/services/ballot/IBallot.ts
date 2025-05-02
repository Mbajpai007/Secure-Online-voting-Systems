import { Candidate } from '../candidateService';

export interface IBallot {
    id: number;
    title: string;
    description: string;
    candidates: Candidate[];
    type: BallotType;
    render(): JSX.Element;
    validate(vote: any): boolean;
}

export enum BallotType {
    YesNo = 'YesNo',
    RankedChoice = 'RankedChoice',
    MultipleChoice = 'MultipleChoice'
} 