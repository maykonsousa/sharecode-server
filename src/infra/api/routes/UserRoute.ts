import { NextFunction, Request, Response, Router } from 'express'
import { AuthenticateUserGitHub } from '../../../application/usecases/accounts/AuthenticateUserGitHub/AuthenticateUserGitHub'
import { CreateUser } from '../../../application/usecases/accounts/CreateUser/CreateUser'
import { ForgotPassword } from '../../../application/usecases/accounts/ForgotPassword/ForgotPassword'
import { GetUserGitHub } from '../../../application/usecases/accounts/GetUserGitHub/GetUserGitHub'
import { ResetPassword } from '../../../application/usecases/accounts/ResetPassword/ResetPassword'
import { FindPostsByUser } from '../../../application/usecases/posts/FindPostsByUser/FindPostsByUser'
import { Bcrypt } from '../../../infra/adapters/Bcrypt'
import { Ejs } from '../../adapters/Ejs'
import { JSONWebToken } from '../../adapters/JSONWebToken'
import { Nodemailer } from '../../adapters/Nodemailer'
import { GitHubGateway } from '../../gateways/GitHubGateway'
import { PostRepositoryPrisma } from '../../repositories/database/PostRepositoryPrisma'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { CreateUserController } from '../controllers/accounts/CreateUserController'
import { ForgotPasswordContoller } from '../controllers/accounts/ForgotPasswordContoller'
import { AuthenticateUserGitHubController } from '../controllers/accounts/GetUserGitHubController'
import { ResetPasswordController } from '../controllers/accounts/ResetPasswordController'
import { FindPostsByUserController } from '../controllers/posts/FindPostsByUserController'

const router = Router()

const userRepository = new UserRepositoryPrisma()
const postRepository = new PostRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const gitHubGateway = new GitHubGateway()
const hash = new Bcrypt()
const sign = new JSONWebToken()
const mail = new Nodemailer()
const template = new Ejs()

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
    const createUser = new CreateUser(userRepository, hash)
    const createUserController = new CreateUserController(createUser)
    return createUserController.handle(req, res, next)
})

router.get('/users/:id/posts', async (req: Request, res: Response, next: NextFunction) => {
    const findPostsByUser = new FindPostsByUser(postRepository, userRepository, sign)
    const findPostsByUserController = new FindPostsByUserController(findPostsByUser)
    return findPostsByUserController.handle(req, res, next)
})

router.get('/users/github/:code', async (req: Request, res: Response, next: NextFunction) => {
    const authenticateUserGitHub = new AuthenticateUserGitHub(gitHubGateway)
    const getUserGitHub = new GetUserGitHub(gitHubGateway)
    const authenticateUserGitHubController = new AuthenticateUserGitHubController(getUserGitHub, authenticateUserGitHub)
    return authenticateUserGitHubController.handle(req, res, next)
})

router.post('/users/password', (req: Request, res: Response, next: NextFunction) => {
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, sign, mail, template)
    const forgotPasswordContoller = new ForgotPasswordContoller(forgotPassword)
    return forgotPasswordContoller.handle(req, res, next)
})

router.put('/users/password', (req: Request, res: Response, next: NextFunction) => {
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, sign)
    const resetPasswordContoller = new ResetPasswordController(resetPassword)
    return resetPasswordContoller.handle(req, res, next)
})

router.delete('/users/clean', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userRepository.clean()
        res.status(204).end()
    } catch (err) {
        next(err)
    }
})

export default router
