import express, { NextFunction, Request, Response } from 'express'
import { CustomError } from './application/exceptions/CustomError'
import { AuthenticateUser } from './application/usecases/accounts/AuthenticateUser/AuthenticateUser'
import { AuthenticateUserGitHub } from './application/usecases/accounts/AuthenticateUserGitHub/AuthenticateUserGitHub'
import { CreateUser } from './application/usecases/accounts/CreateUser/CreateUser'
import { ForgotPassword } from './application/usecases/accounts/ForgotPassword/ForgotPassword'
import { GetUserGitHub } from './application/usecases/accounts/GetUserGitHub/GetUserGitHub'
import { ResetPassword } from './application/usecases/accounts/ResetPassword/ResetPassword'
import { RevokeToken } from './application/usecases/accounts/RevokeToken/RevokeToken'
import { ActivePost } from './application/usecases/posts/ActivePost/ActivePost'
import { CreatePost } from './application/usecases/posts/CreatePost/CreatePost'
import { DeactivePost } from './application/usecases/posts/DeactivePost/DeactivePost'
import { FindPosts } from './application/usecases/posts/FindPosts/FindPosts'
import { FindPostsByUser } from './application/usecases/posts/FindPostsByUser/FindPostsByUser'
import { FindPublicPosts } from './application/usecases/posts/FindPublicPosts/FindPublicPosts'
import { RemovePost } from './application/usecases/posts/RemovePost/RemovePost'
import { Bcrypt } from './infra/adapters/Bcrypt'
import { Ejs } from './infra/adapters/Ejs'
import { JSONWebToken } from './infra/adapters/JSONWebToken'
import { Nodemailer } from './infra/adapters/Nodemailer'
import { Pagination } from './infra/adapters/Pagination'
import { AuthenticateUserController } from './infra/controllers/accounts/AuthenticateUserController'
import { CreateUserController } from './infra/controllers/accounts/CreateUserController'
import { ForgotPasswordContoller } from './infra/controllers/accounts/ForgotPasswordContoller'
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
import { GitHubGateway } from './infra/gateways/GitHubGateway'
import AuthMiddleware from './infra/http/middlewares/AuthMiddleware'
import { AuthRoute } from './infra/http/routes/AuthRoute'
import { PostRoute } from './infra/http/routes/PostRoute'
import { UserRoute } from './infra/http/routes/UserRoute'
import { PostRepositoryPrisma } from './infra/repositories/database/PostRepositoryPrisma'
import { TokenRepositoryPrisma } from './infra/repositories/database/TokenRepositoryPrisma'
import { UserRepositoryPrisma } from './infra/repositories/database/UserRepositoryPrisma'

// repositories
const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const postRepository = new PostRepositoryPrisma()
const gitHubGateway = new GitHubGateway()

// adapters
const hash = new Bcrypt()
const sign = new JSONWebToken()
const mail = new Nodemailer()
const template = new Ejs()
const pagination = new Pagination()

// usecases
const createUser = new CreateUser(userRepository, hash)
const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mail, template)
const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign)
const getUserGitHub = new GetUserGitHub(gitHubGateway)
const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
const authenticateUserGitHub = new AuthenticateUserGitHub(gitHubGateway)
const revokeToken = new RevokeToken(tokenRepository, sign)
const createPost = new CreatePost(postRepository, userRepository)
const findPosts = new FindPosts(postRepository, userRepository, sign, pagination)
const findPostsByUser = new FindPostsByUser(postRepository, userRepository, sign)
const findPublicPosts= new FindPublicPosts(postRepository, userRepository, sign, pagination)
const activePost = new ActivePost(postRepository, userRepository, tokenRepository, sign)
const deactivePost = new DeactivePost(postRepository, userRepository, tokenRepository, sign)
const removePost = new RemovePost(postRepository, userRepository, tokenRepository, sign)

// controllers
const createUserController = new CreateUserController(createUser)
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
const port = process.env.PORT || 3000

app.use(express.json())

new UserRoute(
    app,
    createUserController,
    authenticateUserGitHubController,
    forgotPasswordController,
    resetPasswordController
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

app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
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
