/* eslint-disable consistent-return */
import { NextFunction, Request, Response } from 'express'
import { AuthenticateUser } from '../../../../application/usecases/accounts/AuthenticateUser/AuthenticateUser'

export class AuthenticateUserController {
    constructor(private authenticateUser: AuthenticateUser) {}

    async handle(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        try {
            const response = await this.authenticateUser.execute(req.body)
            return res.status(200).json(response)
        } catch (err) {
            next(err)
        }
    }
}
