import { NextFunction, Request, Response } from 'express'
import { FindPublicPosts } from '../../../../application/usecases/posts/FindPublicPosts/FindPublicPosts'

export class FindPublicPostsController {
    constructor(
        readonly findPublicPosts: FindPublicPosts
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const posts = await this.findPublicPosts.execute(req.body)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
