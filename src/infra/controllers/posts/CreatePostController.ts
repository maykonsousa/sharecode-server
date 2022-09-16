import { NextFunction, Request, Response } from 'express'
import { CreatePost } from '../../../application/usecases/posts/CreatePost/CreatePost'

export class CreatePostController {
    constructor(
        private readonly createPost: CreatePost
    ) {}

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.createPost.execute(req.body)
            return res.status(201).end()
        } catch (err) {
            next(err)
        }
    }
}
