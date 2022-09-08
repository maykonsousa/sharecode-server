import { NextFunction, Request, Response, Router } from 'express'
import { AuthenticateUser } from '../../../application/usecases/accounts/AuthenticateUser/AuthenticateUser'
import { RevokeToken } from '../../../application/usecases/accounts/RevokeToken/RevokeToken'
import { Bcrypt } from '../../../infra/adapters/Bcrypt'
import { JSONWebToken } from '../../../infra/adapters/JSONWebToken'
import { TokenRepositoryPrisma } from '../../repositories/database/TokenRepositoryPrisma'
import { UserRepositoryPrisma } from '../../repositories/database/UserRepositoryPrisma'
import { AuthenticateUserController } from '../controllers/accounts/AuthenticateUserController'
import { RevokeTokenController } from '../controllers/accounts/RevokeTokenController'

const userRepository = new UserRepositoryPrisma()
const tokenRepository = new TokenRepositoryPrisma()
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
