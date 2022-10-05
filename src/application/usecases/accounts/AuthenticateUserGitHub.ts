import { GitHubGateway } from '../../../infra/gateways/GitHubGateway'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class AuthenticateUserGitHub {
    constructor (
        readonly gitHubGateway: GitHubGateway
    ) { }

    async execute(code: string): Promise<string> {
        if (!code) throw new MissingParamError('code is required')
        const access_token = await this.gitHubGateway.newAccessToken(code)
        return access_token
    }
}
