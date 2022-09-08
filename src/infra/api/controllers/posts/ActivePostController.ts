import { NextFunction, Request, Response } from 'express'
import { ActivePost } from '../../../../application/usecases/posts/ActivePost/ActivePost'

export class ActivePostController {
    constructor(
        readonly activePost: ActivePost
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response> {
        try {
            const input = {
                id: req.params.id,
                token: req.body.token
            }
            await this.activePost.execute(input)
            return res.status(204).end()
        } catch (err) {
            next(err)
        }
    }
}
