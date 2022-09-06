import { User } from '../../../../domain/entities/User'
import { TokenRepository } from '../../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Hash } from '../../../../infra/adapters/Hash'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'
import { ResetPasswordInput } from './ResetPasswordInput'

export class ResetPassword {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly hash: Hash,
        readonly sign: Sign
    ) { }

    async execute(input: ResetPasswordInput): Promise<void> {
        if (!input.token) throw new CustomError(400, 'token is required')
        if (!input.password) throw new CustomError(400, 'password is required')
        const existsToken = await this.tokenRepository.find(input.token)
        if (!existsToken) throw new CustomError(404, 'token not found')
        if (existsToken.type !== 'forgot_password') throw new CustomError(403, 'not allowed')
        try {
            this.sign.decode(existsToken.token)
        } catch (error) {
            throw new CustomError(401, 'token is invalid or expired')
        }
        const existsUser = await this.userRepository.find(existsToken.userId)
        if (!existsUser) throw new CustomError(404, 'user not found')
        const isPasswordMath = this.hash.decrypt(input.password, existsUser.password.getValue())
        if (isPasswordMath) throw new CustomError(400, 'password should be diff to old password')
        const user = new User(
            existsUser.id,
            existsUser.gh_username,
            existsUser.name,
            existsUser.email.getValue(),
            input.password,
            existsUser.type
        )
        const password = this.hash.encrypt(input.password)
        user.password.setValue(password)
        await this.userRepository.update(user)
        await this.tokenRepository.delete(existsToken.id)
    }
}
