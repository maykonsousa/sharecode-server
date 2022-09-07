import { Router, Request, Response, NextFunction } from 'express'
import AuthMiddleware from '../middlewares/AuthMiddleware'
import { CreatePost } from '../../../application/usecases/posts/CreatePost/CreatePost'
import { CreatePostController } from '../controllers/posts/CreatePostController'
import { PostRepositoryPrisma } from '../../repositories/database/PostRepositoryPrisma'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { FindPosts } from '../../../application/usecases/posts/FindPosts/FindPosts'
import { FindPostsController } from '../controllers/posts/FindPostsController'
import { ActivePost } from '../../../application/usecases/posts/ActivePost/ActivePost'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { JSONWebToken } from '../../adapters/JSONWebToken'
import { ActivePostController } from '../controllers/posts/ActivePostController'
import { RemovePost } from '../../../application/usecases/posts/RemovePost/RemovePost'
import { RemovePostController } from '../controllers/posts/RemovePostController'
import { DeactivePost } from '../../../application/usecases/posts/DeactivePost/DeactivePost'
import { DeactivePostController } from '../controllers/posts/DeactivePostController'

const postRepository = new PostRepositoryPrisma()
const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const jwt = new JSONWebToken()

const router = Router()

router.post('/posts', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const createPost = new CreatePost(postRepository, userRepository)
    const createPostController = new CreatePostController(createPost)
    return createPostController.handle(req, res, next)
})

router.delete('/posts/:id', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const removePost = new RemovePost(postRepository, jwt)
    const removePostController = new RemovePostController(removePost)
    return removePostController.handle(req, res, next)
})

router.get('/posts', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const findPosts = new FindPosts(postRepository)
    const findPostsController = new FindPostsController(findPosts)
    return findPostsController.handle(req, res, next)
})

router.put('/posts/:id/active', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const activePost = new ActivePost(postRepository)
    const activePostController = new ActivePostController(activePost)
    return activePostController.handle(req, res, next)
})

router.put('/posts/:id/deactive', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const deactivePost = new DeactivePost(postRepository)
    const deactivePostController = new DeactivePostController(deactivePost)
    return deactivePostController.handle(req, res, next)
})

export default router
