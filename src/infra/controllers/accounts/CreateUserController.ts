import { NextFunction, Request, Response } from 'express'
import { CreateUser } from '../../../application/usecases/accounts/CreateUser'

export class CreateUserController {
    constructor(
        private readonly createUser: CreateUser
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.createUser.execute(req.body)
            return res.status(201).end()
        } catch (err) {
            next(err)
        }
    }
}
