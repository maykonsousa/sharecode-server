import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import { CustomError } from './core/exceptions/CustomError'
import { MissingParamError } from './core/exceptions/MissingParamError'
import { NotFoundError } from './core/exceptions/NotFoundError'
import { UnauthorizedError } from './core/exceptions/UnauthorizedError'
import { ValidationException } from './core/exceptions/ValidationException'
import { AuthenticateUser } from './core/usecases/accounts/AuthenticateUser'
import { AuthenticateUserGitHub } from './core/usecases/accounts/AuthenticateUserGitHub'
import { CreateUser } from './core/usecases/accounts/CreateUser'
import { ForgotPassword } from './core/usecases/accounts/ForgotPassword'
import { GetUser } from './core/usecases/accounts/GetUser'
import { GetUserGitHub } from './core/usecases/accounts/GetUserGitHub'
import { ResetPassword } from './core/usecases/accounts/ResetPassword'
import { RevokeToken } from './core/usecases/accounts/RevokeToken'
import { ActivePost } from './core/usecases/posts/ActivePost'
import { CreatePost } from './core/usecases/posts/CreatePost'
import { DeactivePost } from './core/usecases/posts/DeactivePost'
import { FindPosts } from './core/usecases/posts/FindPosts'
import { FindPostsByUser } from './core/usecases/posts/FindPostsByUser'
import { FindPublicPosts } from './core/usecases/posts/FindPublicPosts'
import { RemovePost } from './core/usecases/posts/RemovePost'
import { Bcrypt } from './infra/adapters/Bcrypt'
import { JSONWebToken } from './infra/adapters/JSONWebToken'
import { Pagination } from './infra/adapters/Pagination'
import { Validator } from './infra/adapters/Validator'
import { AuthenticateUserController } from './infra/controllers/accounts/AuthenticateUserController'
import { CreateUserController } from './infra/controllers/accounts/CreateUserController'
import { ForgotPasswordContoller } from './infra/controllers/accounts/ForgotPasswordContoller'
import { GetUserController } from './infra/controllers/accounts/GetUserController'
import { AuthenticateUserGitHubController } from './infra/controllers/accounts/GetUserGitHubController'
import { ResetPasswordController } from './infra/controllers/accounts/ResetPasswordController'
import { RevokeTokenController } from './infra/controllers/accounts/RevokeTokenController'
import { ActivePostController } from './infra/controllers/posts/ActivePostController'
import { CreatePostController } from './infra/controllers/posts/CreatePostController'
import { DeactivePostController } from './infra/controllers/posts/DeactivePostController'
import { FindPostsByUserController } from './infra/controllers/posts/FindPostsByUserController'
import { FindPostsController } from './infra/controllers/posts/FindPostsController'
import { FindPublicPostsController } from './infra/controllers/posts/FindPublicPostsController'
import { RemovePostController } from './infra/controllers/posts/RemovePostController'
import { PrismaDBAdapter } from './infra/database/PrismaDBAdapter'
import { GitHubGateway } from './infra/gateways/GitHubGateway'
import AuthMiddleware from './infra/http/middlewares/AuthMiddleware'
import { AuthRoute } from './infra/http/routes/AuthRoute'
import { PostRoute } from './infra/http/routes/PostRoute'
import { UserRoute } from './infra/http/routes/UserRoute'
import { RabbitMQAdapter } from './infra/queue/RabbitMQAdapter'
import { PostRepositoryPrisma } from './infra/repositories/database/PostRepositoryPrisma'
import { TokenRepositoryPrisma } from './infra/repositories/database/TokenRepositoryPrisma'
import { UserRepositoryPrisma } from './infra/repositories/database/UserRepositoryPrisma'

const init = async () => {
    // adapters
    const hash = new Bcrypt()
    const sign = new JSONWebToken()
    const pagination = new Pagination()
    const validator = new Validator()
    const prisma = new PrismaDBAdapter()
    prisma.connect()
    const queue = new RabbitMQAdapter()
    await queue.connect()

    // repositories
    const userRepository = new UserRepositoryPrisma(prisma)
    const tokenRepository = new TokenRepositoryPrisma(prisma)
    const postRepository = new PostRepositoryPrisma(prisma)
    const gitHubGateway = new GitHubGateway()

    // usecases
    const createUser = new CreateUser(userRepository, hash, queue)
    const getUser = new GetUser(userRepository)
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, queue)
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign)
    const getUserGitHub = new GetUserGitHub(gitHubGateway)
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const authenticateUserGitHub = new AuthenticateUserGitHub(gitHubGateway)
    const revokeToken = new RevokeToken(tokenRepository, sign)
    const createPost = new CreatePost(postRepository, userRepository, validator)
    const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
    const findPostsByUser = new FindPostsByUser(postRepository, userRepository, sign, validator)
    const findPublicPosts = new FindPublicPosts(postRepository, userRepository, sign, pagination)
    const activePost = new ActivePost(postRepository, userRepository, sign, validator)
    const deactivePost = new DeactivePost(postRepository, userRepository, sign, validator)
    const removePost = new RemovePost(postRepository, userRepository, sign, validator)
    
    // controllers
    const createUserController = new CreateUserController(createUser)
    const getUserController = new GetUserController(getUser)
    const authenticateUserController = new AuthenticateUserController(authenticateUser)
    const authenticateUserGitHubController = new AuthenticateUserGitHubController(getUserGitHub, authenticateUserGitHub)
    const forgotPasswordController = new ForgotPasswordContoller(forgotPassword)
    const resetPasswordController = new ResetPasswordController(resetPassword)
    const revokeTokenController = new RevokeTokenController(revokeToken)
    const createPostController = new CreatePostController(createPost)
    const findPostsController = new FindPostsController(findPosts)
    const findPostsByUserController = new FindPostsByUserController(findPostsByUser)
    const findPublicPostsController = new FindPublicPostsController(findPublicPosts)
    const activePostController = new ActivePostController(activePost)
    const deactivePostController = new DeactivePostController(deactivePost)
    const removePostController = new RemovePostController(removePost)

    const app = express()
    const port = process.env.PORT || 3001

    app.use(express.json())
    app.use(cors())

    new UserRoute(
        app,
        createUserController,
        authenticateUserGitHubController,
        forgotPasswordController,
        resetPasswordController,
        getUserController
    ).init()

    new AuthRoute(
        app,
        authenticateUserController,
        revokeTokenController
    ).init()

    new PostRoute(
        app,
        createPostController,
        findPostsController,
        findPostsByUserController,
        findPublicPostsController,
        activePostController,
        deactivePostController,
        removePostController,
        AuthMiddleware
    ).init()

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({
            message: 'resource not found',
            status: res.status
        })
        next()
    })

    app.use((
        err: Error
            & CustomError
            & MissingParamError
            & NotFoundError
            & UnauthorizedError
            & ValidationException,
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const status = err.status || 500
        const message = err.message || 'internal server error'
        res.status(status).json({
            message,
            status
        })
        next()
    })

    app.listen(port, () => {
        console.log(`Starting server in ${port}`)
    })
}

init()
