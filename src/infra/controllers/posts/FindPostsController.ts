import { NextFunction, Request, Response } from 'express'
import { FindPosts } from '../../../application/usecases/posts/FindPosts'

export class FindPostsController {
    constructor(
        private readonly findPosts: FindPosts
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                page: parseInt(String(req.query.page)),
                limit: parseInt(String(req.query.limit)),
                token: req.body.token
            }
            const posts = await this.findPosts.execute(input)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
