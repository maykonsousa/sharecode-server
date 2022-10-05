import { Express, NextFunction, Request, Response, Router } from 'express'
import { AuthenticateUserController } from '../../controllers/accounts/AuthenticateUserController'
import { RevokeTokenController } from '../../controllers/accounts/RevokeTokenController'

export class AuthRoute {
    private router: Router

    constructor(
        readonly app: Express,
        readonly authenticateUserController: AuthenticateUserController,
        readonly revokeTokenController: RevokeTokenController
    ) {
        this.router = Router()
        this.app.use('/v1', this.router)
    }

    init(): void {
        this.router.post('/auth', async (req: Request, res: Response, next: NextFunction) => {
            return this.authenticateUserController.handle(req, res, next)
        })
        
        this.router.post('/auth/revoke', async (req: Request, res: Response, next: NextFunction) => {
            return this.revokeTokenController.handle(req, res, next)
        })
    }
}
