import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../core/domain/CurrentDate'
import { Token } from '../../../core/domain/Token'
import { TokenRepository } from '../../../core/domain/TokenRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Sign } from '../../../infra/adapters/Sign'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class AuthenticateUser {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly hash: Hash,
        readonly sign: Sign
    ) { }

    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        if (!input.email) throw new MissingParamError(ValidationMessages.EMPTY_EMAIL)
        if (!input.password) throw new MissingParamError(ValidationMessages.EMPTY_PASSWORD)
        const existingUser = await this.userRepository.findByEmail(input.email)
        if (!existingUser) throw new UnauthorizedError(ValidationMessages.INVALID_LOGIN)
        const isPasswordMatch = this.hash.decrypt(input.password, existingUser.getPassword())
        if (!isPasswordMatch) throw new UnauthorizedError(ValidationMessages.INVALID_LOGIN)
        const encodedToken = this.sign.encode({
            id: existingUser.id,
            type: existingUser.getRule()
        }, '1h')
        const expiresAt = new CurrentDate().addHours(1)
        const token = new Token(
            randomUUID(),
            encodedToken,
            existingUser.id,
            'refresh_token',
            false,
            expiresAt
        )
        await this.tokenRepository.save(token)
        return {
            token: encodedToken,
            refreshToken: token.id
        }
    }
}

export type AuthenticateUserInput = {
    email: string
    password: string
}

type AuthenticateUserOutput = {
    token: string,
    refreshToken: string
}
