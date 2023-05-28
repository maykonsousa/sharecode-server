export class UnauthorizedError extends Error {
    public readonly status: number

    constructor(
        readonly message: string
    ) { 
        super()
        this.status = 401
    }
}
