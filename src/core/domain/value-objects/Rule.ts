import { ValidationException } from '../../exceptions/ValidationException'

export class Rule {
    constructor(
        readonly value: string
    ) {
        this.validate()
    }

    private validate(): void {
        if (this.isInvalidRule()) throw new ValidationException('invalid rule')
    }

    private isInvalidRule(): boolean {
        const ACCEPTED_RULES = ['user', 'admin', 'moderator']
        return !ACCEPTED_RULES.includes(this.value)
    }

    getValue(): string {
        return this.value
    }
}
