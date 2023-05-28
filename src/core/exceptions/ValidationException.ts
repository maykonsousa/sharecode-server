export class ValidationException extends Error {
    readonly status: number

    constructor(
        readonly message: string
    ) {
        super(message)
        this.status = 422
    }
}
