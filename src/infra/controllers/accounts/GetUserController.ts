import { NextFunction, Request, Response } from 'express'
import { GetUser } from '../../../core/usecases/accounts/GetUser'

export class GetUserController {
    constructor(
        readonly getUser: GetUser
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const user = await this.getUser.execute(req.params.id)
            return res.status(200).json(user)
        } catch (err) {
            next(err)
        }
    }
}
