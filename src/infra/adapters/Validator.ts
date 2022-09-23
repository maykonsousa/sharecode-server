import { MissingParamError } from '../../application/exceptions/MissingParamError'

export class Validator {
    isMissingParam(fieldsRequired: string[], input: any): MissingParamError {
        for (const field of fieldsRequired) {
            if (!input[field]) throw new Error(`${field} is required`)
        }
        return
    }
}
