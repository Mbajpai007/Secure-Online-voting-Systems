export interface ValidationContext {
    userId: number;
    candidateId: number;
    timestamp: Date;
    digitalSignature?: string;
    ipAddress?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errorMessage?: string;
}

export interface VoteValidator {
    setNext(validator: VoteValidator): VoteValidator;
    validate(context: ValidationContext): ValidationResult;
}

export abstract class BaseValidator implements VoteValidator {
    private nextValidator: VoteValidator | null = null;

    setNext(validator: VoteValidator): VoteValidator {
        this.nextValidator = validator;
        return validator;
    }

    validate(context: ValidationContext): ValidationResult {
        const result = this.validateInternal(context);
        
        if (!result.isValid) {
            return result;
        }

        if (this.nextValidator) {
            return this.nextValidator.validate(context);
        }

        return result;
    }

    protected abstract validateInternal(context: ValidationContext): ValidationResult;
}

export class SignatureValidator extends BaseValidator {
    protected validateInternal(context: ValidationContext): ValidationResult {
        if (!context.digitalSignature) {
            return {
                isValid: false,
                errorMessage: 'Digital signature is required'
            };
        }

        // TODO: Implement actual signature verification
        return { isValid: true };
    }
}

export class EligibilityValidator extends BaseValidator {
    protected validateInternal(context: ValidationContext): ValidationResult {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                isValid: false,
                errorMessage: 'User must be logged in to vote'
            };
        }

        // TODO: Add more eligibility checks
        return { isValid: true };
    }
}

export class TamperValidator extends BaseValidator {
    protected validateInternal(context: ValidationContext): ValidationResult {
        const timeSinceVote = new Date().getTime() - context.timestamp.getTime();
        if (timeSinceVote > 5 * 60 * 1000) { // 5 minutes
            return {
                isValid: false,
                errorMessage: 'Vote timestamp is invalid'
            };
        }

        return { isValid: true };
    }
}

export class VoteValidationChain {
    private chain: VoteValidator;

    constructor() {
        const signatureValidator = new SignatureValidator();
        const eligibilityValidator = new EligibilityValidator();
        const tamperValidator = new TamperValidator();

        signatureValidator
            .setNext(eligibilityValidator)
            .setNext(tamperValidator);

        this.chain = signatureValidator;
    }

    validate(context: ValidationContext): ValidationResult {
        return this.chain.validate(context);
    }
} 