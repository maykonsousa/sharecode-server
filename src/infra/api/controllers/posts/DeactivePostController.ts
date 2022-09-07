import { NextFunction, Request, Response } from 'express'
import { DeactivePost } from '../../../../application/usecases/posts/DeactivePost/DeactivePost'

export class DeactivePostController {
    constructor(
        readonly deactivePost: DeactivePost
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.deactivePost.execute(req.params.id)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
