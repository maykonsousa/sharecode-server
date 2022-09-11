import { NextFunction, Request, Response, Router } from 'express'
import { ActivePost } from '../../../application/usecases/posts/ActivePost/ActivePost'
import { CreatePost } from '../../../application/usecases/posts/CreatePost/CreatePost'
import { DeactivePost } from '../../../application/usecases/posts/DeactivePost/DeactivePost'
import { FindPosts } from '../../../application/usecases/posts/FindPosts/FindPosts'
import { FindPostsByUser } from '../../../application/usecases/posts/FindPostsByUser/FindPostsByUser'
import { FindPublicPosts } from '../../../application/usecases/posts/FindPublicPosts/FindPublicPosts'
import { RemovePost } from '../../../application/usecases/posts/RemovePost/RemovePost'
import { JSONWebToken } from '../../adapters/JSONWebToken'
import { PostRepositoryPrisma } from '../../repositories/database/PostRepositoryPrisma'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { ActivePostController } from '../controllers/posts/ActivePostController'
import { CreatePostController } from '../controllers/posts/CreatePostController'
import { DeactivePostController } from '../controllers/posts/DeactivePostController'
import { FindPostsByUserController } from '../controllers/posts/FindPostsByUserController'
import { FindPostsController } from '../controllers/posts/FindPostsController'
import { FindPublicPostsController } from '../controllers/posts/FindPublicPostsController'
import { RemovePostController } from '../controllers/posts/RemovePostController'
import AuthMiddleware from '../middlewares/AuthMiddleware'

const postRepository = new PostRepositoryPrisma()
const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const sign = new JSONWebToken()

const router = Router()

router.post('/posts', AuthMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const createPost = new CreatePost(postRepository, userRepository)
    const createPostController = new CreatePostController(createPost)
    return createPostController.handle(req, res, next)
})

router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
    const findPosts = new FindPosts(postRepository, userRepository, sign)
    const findPostsController = new FindPostsController(findPosts)
    return findPostsController.handle(req, res, next)
})

router.get('/posts/user/:id', async (req: Request, res: Response, next: NextFunction) => {
    const findPostsByUser = new FindPostsByUser(postRepository, userRepository, sign)
    const findPostsByUserController = new FindPostsByUserController(findPostsByUser)
    return findPostsByUserController.handle(req, res, next)
})

router.get('/posts/public', async (req: Request, res: Response, next: NextFunction) => {
    const findPublicPosts = new FindPublicPosts(postRepository, userRepository, sign)
    const findPublicPostsController = new FindPublicPostsController(findPublicPosts)
    return findPublicPostsController.handle(req, res, next)
})

router.put('/posts/:id/active', async (req: Request, res: Response, next: NextFunction) => {
    const activePost = new ActivePost(postRepository, userRepository, tokenRepository, sign)
    const activePostController = new ActivePostController(activePost)
    return activePostController.handle(req, res, next)
})

router.put('/posts/:id/deactive', async (req: Request, res: Response, next: NextFunction) => {
    const deactivePost = new DeactivePost(postRepository, userRepository, tokenRepository, sign)
    const deactivePostController = new DeactivePostController(deactivePost)
    return deactivePostController.handle(req, res, next)
})

router.delete('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
    const removePost = new RemovePost(postRepository, userRepository, tokenRepository, sign)
    const removePostController = new RemovePostController(removePost)
    return removePostController.handle(req, res, next)
})

export default router
