import { CustomError } from '../../../application/exceptions/CustomError'

export class Email {
    private value: string

    constructor(value: string) {
        if (!this.validate(value)) throw new CustomError(400, 'invalid email')
        this.value = value
    }

    getValue(): string {
        return this.value
    }

    private isValidEmail(email: string): boolean {
        return /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/.test(email)
    }

    private validate(email: string): boolean {
        if (!email) return false
        return this.isValidEmail(email)
    }
}
