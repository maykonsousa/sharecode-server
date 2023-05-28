import { ValidationException } from '../../exceptions/ValidationException'

export class Password {

    constructor(
        private value: string
    ) {
        this.validate()
    }
    
    private validate(): void {
        if (this.isInvalidPassword()) throw new ValidationException('invalid password')
    }

    private isInvalidPassword(): boolean {
        return this.value.length < 6
    }

    getValue(): string {
        return this.value
    }
}
