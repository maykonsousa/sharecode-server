import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../../domain/entities/CurrentDate'
import { Token } from '../../../../domain/entities/Token'
import { TokenRepository } from '../../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Hash } from '../../../../infra/adapters/Hash'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'
import { AuthenticateUserInput } from './AutheticateUserInput'
import { AuthenticateUserOutput } from './AutheticateUserOutput'

export class AuthenticateUser {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly hash: Hash,
        readonly sign: Sign
    ) { }

    async execute(input: AuthenticateUserInput): Promise<AuthenticateUserOutput> {
        if (!input.email) throw new CustomError(400, 'email is required')
        if (!input.password) throw new CustomError(400, 'password is required')
        const existsUser = await this.userRepository.findByEmail(input.email)
        if (!existsUser) throw new CustomError(401, 'invalid login')
        const isPasswordMath = this.hash.decrypt(input.password,existsUser.password.getValue())
        if (!isPasswordMath) throw new CustomError(401, 'invalid login')
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
