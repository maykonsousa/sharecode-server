import { NextFunction, Request, Response } from 'express'
import { FindPosts } from '../../../../application/usecases/posts/FindPosts/FindPosts'

export class FindPostsController {
    constructor(
        readonly findPosts: FindPosts
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const posts = await this.findPosts.execute(req.body)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
