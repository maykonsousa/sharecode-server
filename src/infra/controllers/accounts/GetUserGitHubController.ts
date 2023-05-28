import { NextFunction, Request, Response } from 'express'
import { AuthenticateUserGitHub } from '../../../core/usecases/accounts/AuthenticateUserGitHub'
import { GetUserGitHub } from '../../../core/usecases/accounts/GetUserGitHub'

export class AuthenticateUserGitHubController {
    constructor(
        readonly getUserGitHub: GetUserGitHub,
        readonly authenticateUserGitHub: AuthenticateUserGitHub
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const access_token = await this.authenticateUserGitHub.execute(req.params.code)
            const user = await this.getUserGitHub.execute(access_token)
            return res.status(200).json(user)
        } catch (err) {
            next(err)
        }
    }
}
