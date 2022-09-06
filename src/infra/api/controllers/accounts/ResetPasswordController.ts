import { Request, Response, NextFunction } from 'express'
import { ResetPassword } from '../../../../application/usecases/accounts/ResetPassword/ResetPassword'

export class ResetPasswordController {
    constructor(
        readonly resetPassword: ResetPassword
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.resetPassword.execute(req.body)
            return res.status(200).end()
        } catch (err) {
            next(err)
        }
    }
}