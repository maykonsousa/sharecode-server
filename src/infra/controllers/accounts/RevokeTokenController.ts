import { NextFunction, Request, Response } from 'express'
import { RevokeToken } from '../../../application/usecases/accounts/RevokeToken'


export class RevokeTokenController {
    constructor(
        readonly revokeToken: RevokeToken
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const revokedToken = await this.revokeToken.execute(req.body.refresh_token)
            return res.status(200).json(revokedToken)
        } catch (err) {
            next(err)
        }
    }
}
