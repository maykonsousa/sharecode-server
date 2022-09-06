import { GitHubGateway } from '../../../../infra/gateways/GitHubGateway'
import { CustomError } from '../../../exceptions/CustomError'

export class AuthenticateUserGitHub {
    constructor (
        readonly gitHubGateway: GitHubGateway
    ) { }

    async execute(code: string): Promise<string> {
        if (!code) throw new CustomError(400, 'code is required')
        const access_token = await this.gitHubGateway.newAccessToken(code)
        return access_token
    }
}
