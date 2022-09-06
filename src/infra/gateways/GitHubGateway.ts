import axios from 'axios'
import { CustomError } from '../../application/exceptions/CustomError'

export class GitHubGateway {
    async newAccessToken(code: string): Promise<string> {
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://github.com/login/oauth/access_token',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    client_id: process.env.CLIENT_ID,
                    client_secret: process.env.CLIENT_SECRET,
                    code
                }
            })
            const data = await response.data
            const [, token] = data.split('=')
            return token.replace('&scope', '')
        } catch (err) {
            throw new CustomError(400, 'access token error')
        }
    }

    async getUser(access_token: string): Promise<any> {
        try {
            const response = await axios({
                method: 'GET',
                url: 'https://api.github.com/user',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            return response.data
        } catch (err) {
            throw new CustomError(400, 'fetch user error')
        }
    }
}
