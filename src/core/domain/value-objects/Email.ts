import { ValidationException } from '../../exceptions/ValidationException'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class Email {
    constructor(
        private value: string
    ) {
        this.validate()
    }

    private validate(): void {
        if (this.isInvalidEmail()) throw new ValidationException(ValidationMessages.INVALID_EMAIL)
    }

    private isInvalidEmail(): boolean {
        return !/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(this.value)
    }

    getValue(): string {
        return this.value
    }
}
