import { Router, Request, Response, NextFunction } from 'express'
import { AuthenticateUser } from '../../../application/usecases/accounts/AuthenticateUser/AuthenticateUser'
import { Bcrypt } from '../../../infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../infra/adapters/JSONWebToken'
import { AuthenticateUserController } from '../controllers/accounts/AuthenticateUserController'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { TokenRepositoryMemory } from '../../repositories/memory/TokenRepositoryMemory'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { RevokeToken } from '../../../application/usecases/accounts/RevokeToken/RevokeToken'
import { RevokeTokenController } from '../controllers/accounts/RevokeTokenController'
import { AuthenticateUserGitHub } from '../../../application/usecases/accounts/AuthenticateUserGitHub/AuthenticateUserGitHub'
import { AuthenticateUserGitHubController } from '../controllers/accounts/GetUserGitHubController'
import { GitHubGateway } from '../../gateways/GitHubGateway'

const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
const gitHubGateway = new GitHubGateway()
const hash = new Bcrypt()
const sign = new JSONWebToken()

const router = Router()

router.post('/auth', async (req: Request, res: Response, next: NextFunction) => {
    const authenticateUser = new AuthenticateUser(userRepository, tokenRepository, hash, sign)
    const authenticateUserController = new AuthenticateUserController(authenticateUser)
    return authenticateUserController.handle(req, res, next)
})


router.post('/auth/revoke', async (req: Request, res: Response, next: NextFunction) => {
    const revokeToken = new RevokeToken(tokenRepository, sign)
    const revokeTokenController = new RevokeTokenController(revokeToken)
    return revokeTokenController.handle(req, res, next)
})

export default router
