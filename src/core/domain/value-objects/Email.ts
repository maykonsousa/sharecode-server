import { ValidationException } from '../../exceptions/ValidationException'

export class Email {
    constructor(
        private value: string
    ) {
        this.validate()
    }

    private validate(): void {
        if (this.isInvalidEmail()) throw new ValidationException('invalid email')
    }

    private isInvalidEmail(): boolean {
        return !/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(this.value)
    }

    getValue(): string {
        return this.value
    }
}
