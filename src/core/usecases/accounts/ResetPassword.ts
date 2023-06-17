import { TokenRepository } from '../../../core/domain/TokenRepository'
import { User } from '../../../core/domain/User'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Sign } from '../../../infra/adapters/Sign'
import { CustomError } from '../../exceptions/CustomError'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class ResetPassword {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly hash: Hash,
        readonly sign: Sign,
    ) { }

    async execute(input: ResetPasswordInput): Promise<void> {
        if (!input.token) new MissingParamError(ValidationMessages.EMPTY_ACCESS_TOKEN)
        if (!input.password) throw new MissingParamError(ValidationMessages.EMPTY_PASSWORD)
        const existingToken = await this.tokenRepository.find(input.token)
        if (!existingToken) throw new NotFoundError('token not found')
        if (existingToken.type !== 'forgot_password') throw new CustomError(403, 'not allowed')
        try {
            this.sign.decode(existingToken.token)
        } catch (error) {
            throw new UnauthorizedError('token is invalid or expired')
        }
        const existingUser = await this.userRepository.find(existingToken.userId)
        if (!existingUser) throw new NotFoundError('user not found')
        const isPasswordMath = this.hash.decrypt(input.password, existingUser.getPassword())
        if (isPasswordMath) throw new CustomError(400, 'password should be diff to old password')
        const user = User.create(
            existingUser.id,
            existingUser.gh_username,
            existingUser.name,
            existingUser.email,
            input.password
        )
        const encryptedPassword = this.hash.encrypt(input.password)
        user.updateEncrypedPassword(encryptedPassword)
        await this.userRepository.update(user)
        await this.tokenRepository.delete(existingToken.id)
    }
}

type ResetPasswordInput = {
    token: string
    password: string
}
