import { MissingParamError } from '../../core/exceptions/MissingParamError'

export class Validator {
    isMissingParam(fieldsRequired: string[], input: any): MissingParamError {
        for (const field of fieldsRequired) {
            if (!input[field]) throw new MissingParamError(`${field} is required`)
        }
        return
    }
}
