import { ValidationException } from '../../exceptions/ValidationException'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class Rule {
    constructor(
        private value: string
    ) {
        this.validate()
    }

    private validate(): void {
        if (this.isInvalidRule()) throw new ValidationException(ValidationMessages.INVALID_RULE)
    }

    private isInvalidRule(): boolean {
        const ACCEPTED_RULES = ['user', 'admin', 'moderator']
        return !ACCEPTED_RULES.includes(this.value)
    }

    getValue(): string {
        return this.value
    }
}
