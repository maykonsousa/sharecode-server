import { CustomError } from '../../../core/exceptions/CustomError'

export class Email {
    constructor(
        readonly value: string
    ) {
        this.validate()
    }

    getValue(): string {
        return this.value
    }

    private isInvalidEmail(): boolean {
        return !/^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(this.value)
    }

    private validate(): void {
        if (!this.value) throw new CustomError(400, 'email is required')
        if (this.isInvalidEmail()) throw new CustomError(400, 'invalid email')
    }
}
