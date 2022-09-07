import { NextFunction, Request, Response } from 'express'
import { ActivePost } from '../../../../application/usecases/posts/ActivePost/ActivePost'

export class ActivePostController {
    constructor(
        readonly activePost: ActivePost
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            await this.activePost.execute(req.params.id)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
