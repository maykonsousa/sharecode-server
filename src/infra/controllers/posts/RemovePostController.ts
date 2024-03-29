import { NextFunction, Request, Response } from 'express'
import { RemovePost } from '../../../core/usecases/posts/RemovePost'

export class RemovePostController {
    constructor(
        readonly removePost: RemovePost
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                id: req.params.id,
                token: req.body.token
            }
            await this.removePost.execute(input)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
