import { ValidationException } from '../../exceptions/ValidationException'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class Password {

    constructor(
        private value: string
    ) {
        this.validate()
    }
    
    private validate(): void {
        if (this.isInvalidPassword()) throw new ValidationException(ValidationMessages.INVALID_PASSWORD)
    }

    private isInvalidPassword (): boolean {
        return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.value)
    }
    getValue(): string {
        return this.value
    }
}
