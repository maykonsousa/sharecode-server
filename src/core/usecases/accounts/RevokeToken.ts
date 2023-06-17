import { Token } from '../../../core/domain/Token'
import { TokenRepository } from '../../../core/domain/TokenRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { ValidationException } from '../../exceptions/ValidationException'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class RevokeToken {
    constructor(
        readonly tokenRepository: TokenRepository,
        readonly sign: Sign
    ) { }

    async execute(refreshTokenId: string): Promise<RevokeTokenOutput> {
        if (!refreshTokenId) throw new MissingParamError(ValidationMessages.EMPTY_REFRESH_TOKEN)
        const existsToken = await this.tokenRepository.find(refreshTokenId)
        if (!existsToken) throw new NotFoundError(ValidationMessages.TOKEN_NOT_FOUND)
        if (existsToken.isRevoked) throw new ValidationException(ValidationMessages.TOKEN_ALREADY_REVOKED)
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

type RevokeTokenOutput = {
    token: string
}
