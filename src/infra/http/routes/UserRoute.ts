import { Express, NextFunction, Request, Response, Router } from 'express'
import { CreateUserController } from '../../controllers/accounts/CreateUserController'
import { ForgotPasswordContoller } from '../../controllers/accounts/ForgotPasswordContoller'
import { GetUserController } from '../../controllers/accounts/GetUserController'
import { AuthenticateUserGitHubController } from '../../controllers/accounts/GetUserGitHubController'
import { ResetPasswordController } from '../../controllers/accounts/ResetPasswordController'

export class UserRoute {
    private router: Router

    constructor(
        readonly app: Express,
        readonly createUserController: CreateUserController,
        readonly authenticateUserGitHubController: AuthenticateUserGitHubController,
        readonly forgotPasswordController: ForgotPasswordContoller,
        readonly resetPasswordController: ResetPasswordController,
        readonly getUserController: GetUserController
    ) {
        this.router = Router()
        this.app.use('/v1', this.router)
    }

    init(): void {
        this.router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
            return this.createUserController.handle(req, res, next)
        })

        this.router.get('/users/:id', async (req: Request, res:Response, next: NextFunction) => {
            return this.getUserController.handle(req, res, next)
        })

        this.router.get('/users/github/:code', async (req: Request, res: Response, next: NextFunction) => {
            return this.authenticateUserGitHubController.handle(req, res, next)
        })

        this.router.post('/users/password', (req: Request, res: Response, next: NextFunction) => {
            return this.forgotPasswordController.handle(req, res, next)
        })

        this.router.put('/users/password', (req: Request, res: Response, next: NextFunction) => {
            return this.resetPasswordController.handle(req, res, next)
        })
    }
}
