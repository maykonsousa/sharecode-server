import { CustomError } from '../../application/exceptions/CustomError'

export class Token {
    constructor(
        readonly id: string,
        readonly token: string,
        readonly userId: string,
        readonly type: string,
        readonly isRevoked: boolean,
        readonly expiresAt: Date
    ) { 
        if (this.isExpiredToken()) throw new CustomError(422, 'expired token')
    }

    private isExpiredToken(currentDate: Date = new Date()): boolean {
        return this.expiresAt.getTime() < currentDate.getTime()
    }
}
