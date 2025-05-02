import { Subject } from 'rxjs';

export interface ElectionEvent {
    type: 'vote_submitted' | 'turnout_milestone' | 'voting_ended';
    data: any;
}

export interface NotificationObserver {
    update(event: ElectionEvent): void;
}

export class NotificationService {
    private static instance: NotificationService;
    private subject = new Subject<ElectionEvent>();
    private observers: NotificationObserver[] = [];

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    subscribe(observer: NotificationObserver) {
        this.observers.push(observer);
        return () => {
            this.observers = this.observers.filter(o => o !== observer);
        };
    }

    notify(event: ElectionEvent) {
        this.subject.next(event);
        this.observers.forEach(observer => observer.update(event));
    }

    // Specific notification methods
    notifyVoteSubmitted(voteData: any) {
        this.notify({
            type: 'vote_submitted',
            data: voteData
        });
    }

    notifyTurnoutMilestone(milestone: string) {
        this.notify({
            type: 'turnout_milestone',
            data: { milestone }
        });
    }

    notifyVotingEnded() {
        this.notify({
            type: 'voting_ended',
            data: { timestamp: new Date().toISOString() }
        });
    }
} 