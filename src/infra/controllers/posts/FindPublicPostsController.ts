import { NextFunction, Request, Response } from 'express'
import { FindPublicPosts } from '../../../core/usecases/posts/FindPublicPosts'
import { CustomRequest } from '../../http/middlewares/AuthMiddleware'

export class FindPublicPostsController {
    constructor(
        readonly findPublicPosts: FindPublicPosts
    ) { }

    async handle(req: CustomRequest, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                page: parseInt(String(req.query.page)),
                limit: parseInt(String(req.query.limit)),
                token: req.token
            }
            const posts = await this.findPublicPosts.execute(input)
            return res.status(200).json(posts)
        } catch (err) {
            next(err)
        }
    }
}
