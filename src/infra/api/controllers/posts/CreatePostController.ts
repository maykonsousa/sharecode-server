/* eslint-disable consistent-return */
import { Request, Response, NextFunction } from 'express'
import { CreatePost } from '../../../../application/usecases/posts/CreatePost/CreatePost'

export class CreatePostController {
    constructor(private createPost: CreatePost) {}

    async handle(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<Response> {
        try {
            await this.createPost.execute(req.body)
            return res.status(201).end()
        } catch (err) {
            next(err)
        }
    }
}
