import { NextFunction, Response } from 'express'
import { FindPostsByUser } from '../../../core/usecases/posts/FindPostsByUser'
import { CustomRequest } from '../../http/middlewares/AuthMiddleware'

export class FindPostsByUserController {
    constructor (
        readonly findPostsByUser: FindPostsByUser
    ) { }
    
    async handle(req: CustomRequest, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                id: req.params.id,
                token: req.token
            }
            const posts = await this.findPostsByUser.execute(input)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
