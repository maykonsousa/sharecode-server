import { NextFunction, Request, Response } from 'express'
import { ForgotPassword } from '../../../core/usecases/accounts/ForgotPassword'

export class ForgotPasswordContoller {
    constructor(
        readonly forgotPassword: ForgotPassword
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.forgotPassword.execute(req.body.email)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
