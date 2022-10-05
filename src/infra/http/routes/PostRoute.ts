import { Express, NextFunction, Request, Response, Router } from 'express'
import { ActivePostController } from '../../controllers/posts/ActivePostController'
import { CreatePostController } from '../../controllers/posts/CreatePostController'
import { DeactivePostController } from '../../controllers/posts/DeactivePostController'
import { FindPostsByUserController } from '../../controllers/posts/FindPostsByUserController'
import { FindPostsController } from '../../controllers/posts/FindPostsController'
import { FindPublicPostsController } from '../../controllers/posts/FindPublicPostsController'
import { RemovePostController } from '../../controllers/posts/RemovePostController'

export class PostRoute {
    private router: Router

    constructor(
        readonly app: Express,
        readonly createPostController: CreatePostController,
        readonly findPostsController: FindPostsController,
        readonly findPostsByUserController: FindPostsByUserController,
        readonly findPublicPostsController: FindPublicPostsController,
        readonly activePostController: ActivePostController,
        readonly deactivePostController: DeactivePostController,
        readonly removePostController: RemovePostController,
        readonly middleware?: any,
    ) {
        this.router = Router()
        this.app.use('/v1', this.router)
    }

    init(): void {
        this.router.post('/posts', this.middleware, async (req: Request, res: Response, next: NextFunction) => {
            return this.createPostController.handle(req, res, next)
        })
        
        this.router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
            return this.findPostsController.handle(req, res, next)
        })
        
        this.router.get('/posts/user/:id', async (req: Request, res: Response, next: NextFunction) => {
            return this.findPostsByUserController.handle(req, res, next)
        })
        
        this.router.get('/posts/public', async (req: Request, res: Response, next: NextFunction) => {
            return this.findPublicPostsController.handle(req, res, next)
        })
        
        this.router.put('/posts/:id/active', async (req: Request, res: Response, next: NextFunction) => {
            return this.activePostController.handle(req, res, next)
        })
        
        this.router.put('/posts/:id/deactive', async (req: Request, res: Response, next: NextFunction) => {
            return this.deactivePostController.handle(req, res, next)
        })
        
        this.router.delete('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
            return this.removePostController.handle(req, res, next)
        })
    }
}
