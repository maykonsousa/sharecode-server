import { CreateUser } from '../../../application/usecases/accounts/CreateUser/CreateUser'
import { Router, Request, Response, NextFunction } from 'express'
import { Bcrypt } from '../../../infra/adapters/Bcrypt'
import { Nodemailer } from '../../adapters/Nodemailer'
import { CreateUserController } from '../controllers/accounts/CreateUserController'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { ForgotPassword } from '../../../application/usecases/accounts/ForgotPassword/ForgotPassword'
import { ForgotPasswordContoller } from '../controllers/accounts/ForgotPasswordContoller'
import { JSONWebToken } from '../../adapters/JSONWebToken'
import { Ejs } from '../../adapters/Ejs'
import { ResetPassword } from '../../../application/usecases/accounts/ResetPassword/ResetPassword'
import { ResetPasswordController } from '../controllers/accounts/ResetPasswordController'
import { TokenRepositoryMemory } from '../../repositories/memory/TokenRepositoryMemory'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { AuthenticateUserGitHub } from '../../../application/usecases/accounts/AuthenticateUserGitHub/AuthenticateUserGitHub'
import { AuthenticateUserGitHubController } from '../controllers/accounts/GetUserGitHubController'
import { GitHubGateway } from '../../gateways/GitHubGateway'
import { GetUserGitHub } from '../../../application/usecases/accounts/GetUserGitHub/GetUserGitHub'

const router = Router()

const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const gitHubGateway = new GitHubGateway()
const hash = new Bcrypt()
const token = new JSONWebToken()
const mail = new Nodemailer()
const template = new Ejs()

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
    const createUser = new CreateUser(userRepository, hash)
    const createUserController = new CreateUserController(createUser)
    return createUserController.handle(req, res, next)
})

router.get('/users/github/:code', async (req: Request, res: Response, next: NextFunction) => {
    const authenticateUserGitHub = new AuthenticateUserGitHub(gitHubGateway)
    const getUserGitHub = new GetUserGitHub(gitHubGateway)
    const authenticateUserGitHubController = new AuthenticateUserGitHubController(getUserGitHub, authenticateUserGitHub)
    return authenticateUserGitHubController.handle(req, res, next)
})

router.post('/users/password', (req: Request, res: Response, next: NextFunction) => {
    const forgotPassword = new ForgotPassword(userRepository, tokenRepository, token, mail, template)
    const forgotPasswordContoller = new ForgotPasswordContoller(forgotPassword)
    return forgotPasswordContoller.handle(req, res, next)
})

router.put('/users/password', (req: Request, res: Response, next: NextFunction) => {
    const resetPassword = new ResetPassword(userRepository, tokenRepository, hash, token)
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
