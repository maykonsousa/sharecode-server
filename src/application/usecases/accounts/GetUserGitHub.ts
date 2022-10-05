import { GitHubGateway } from '../../../infra/gateways/GitHubGateway'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class GetUserGitHub {
    constructor(
        readonly gitHubGateway: GitHubGateway
    ) {}

    async execute(access_token: string): Promise<GetUserGitHubOutput> {
        if (!access_token) throw new MissingParamError('access token is required')
        const user = await this.gitHubGateway.getUser(access_token)
        return {
            gh_username: user.login,
            name: user.name,
            avatar_url: user.avatar_url,
            company: user.company,
            location: user.location,
            bio: user.bio,
            email: user.email
        }
    }
}

type GetUserGitHubOutput = {
    gh_username: string,
    name: string,
    avatar_url: string,
    company: string,
    location: string,
    bio: string,
    email?: string
}
