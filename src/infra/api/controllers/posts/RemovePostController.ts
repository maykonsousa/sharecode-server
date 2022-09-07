import { NextFunction, Request, Response } from 'express'
import { RemovePost } from '../../../../application/usecases/posts/RemovePost/RemovePost'

export class RemovePostController {
    constructor(
        readonly removePost: RemovePost
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.removePost.execute(req.params.id)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
