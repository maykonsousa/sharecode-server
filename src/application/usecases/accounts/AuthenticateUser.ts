import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../domain/entities/CurrentDate'
import { Token } from '../../../domain/entities/Token'
import { TokenRepository } from '../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class AuthenticateUser {
    private readonly fieldsRequired: string[]

    constructor(
        private readonly userRepository: UserRepository,
        private readonly tokenRepository: TokenRepository,
        private readonly hash: Hash,
        private readonly sign: Sign,
        private readonly validator: Validator
    ) { 
        this.fieldsRequired = [
            'email',
            'password'
        ]
    }

    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsUser = await this.userRepository.findByEmail(input.email)
        if (!existsUser) throw new UnauthorizedError('invalid login')
        const isPasswordMath = this.hash.decrypt(input.password,existsUser.password.getValue())
        if (!isPasswordMath) throw new UnauthorizedError('invalid login')
        const encodedToken = this.sign.encode({
            id: existsUser.id,
            type: existsUser.type
        }, '1h')
        const expiresAt = new CurrentDate().addHours(1)
        const token = new Token(
            randomUUID(),
            encodedToken,
            existsUser.id,
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

export type AuthenticateUserOutput = {
    token: string,
    refreshToken: string
}
