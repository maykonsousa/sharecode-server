import { NextFunction, Request, Response } from 'express'
import { FindPostsByUser } from '../../../core/usecases/posts/FindPostsByUser'

export class FindPostsByUserController {
    constructor (
        readonly findPostsByUser: FindPostsByUser
    ) { }
    
    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                id: req.params.id,
                token: req.body.token
            }
            const posts = await this.findPostsByUser.execute(input)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
