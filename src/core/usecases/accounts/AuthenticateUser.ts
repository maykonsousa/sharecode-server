import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../core/domain/CurrentDate'
import { Token } from '../../../core/domain/Token'
import { TokenRepository } from '../../../core/domain/TokenRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Email } from '../../../core/domain/value-objects/Email'
import { Password } from '../../../core/domain/value-objects/Password'
import { Hash } from '../../../infra/adapters/Hash'
import { Sign } from '../../../infra/adapters/Sign'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class AuthenticateUser {
    readonly fieldsRequired: string[]

    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly hash: Hash,
        readonly sign: Sign
    ) { }

    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        this.validate(input)
        const existsUser = await this.userRepository.findByEmail(input.email)
        if (!existsUser) throw new UnauthorizedError('invalid login')
        const password = new Password(input.password)
        const isPasswordMath = this.hash.decrypt(password.getValue(), existsUser.password.getValue())
        if (!isPasswordMath) throw new UnauthorizedError('invalid login')
        const encodedToken = this.sign.encode({
            id: existsUser.id,
            type: existsUser.getRule()
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

    private validate(input: AuthenticateUserInput): void {
        if (!input.email) throw new Error('email is required')
        if (!input.password) throw new Error('password is required')
        new Email(input.email)
        new Password(input.password)
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
