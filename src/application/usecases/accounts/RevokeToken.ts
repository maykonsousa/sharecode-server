import { Token } from '../../../domain/entities/Token'
import { TokenRepository } from '../../../domain/repositories/TokenRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { CustomError } from '../../exceptions/CustomError'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class RevokeToken {
    constructor(
        private readonly tokenRepository: TokenRepository,
        private readonly sign: Sign
    ) { }

    async execute(id: string): Promise<RevokeTokenOutput> {
        if (!id) throw new MissingParamError('id is required')
        const existsToken = await this.tokenRepository.find(id)
        if (!existsToken) throw new CustomError(404, 'token not found')
        if (existsToken.isRevoked) throw new CustomError(422, 'token already revoked')
        const encryptedToken = this.sign.encode({
            id: existsToken.userId,
            type: existsToken.type
        }, '24h')
        const token = new Token(
            existsToken.id,
            encryptedToken,
            existsToken.userId,
            existsToken.type,
            true,
            existsToken.expiresAt
        )
        await this.tokenRepository.upload(token)
        return {
            token: encryptedToken
        }
    }
}

export type RevokeTokenOutput = {
    token: string
}
