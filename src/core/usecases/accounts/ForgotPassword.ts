import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../core/domain/CurrentDate'
import { Token } from '../../../core/domain/Token'
import { TokenRepository } from '../../../core/domain/TokenRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Queue } from '../../../infra/queue/Queue'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class ForgotPassword {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly sign: Sign,
        readonly queue: Queue
    ) { }

    async execute(email: string): Promise<ForgotPasswordOutput> {
        if (!email) throw new MissingParamError('email is required')
        const existingUser = await this.userRepository.findByEmail(email)
        if (!existingUser) return
        const encodedToken = this.sign.encode({ id: existingUser.id, type: existingUser.getRule() }, '15m')
        const currentDate = new CurrentDate()
        const expiredAt = currentDate.addMinutes(15)
        const token = new Token(randomUUID(), encodedToken, existingUser.id, 'forgot_password', false, expiredAt)
        await this.tokenRepository.save(token)
        await this.queue.publish('passwordForgot', {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            token: encodedToken
        })
        return {
            token: token.id
        }
    }
}

type ForgotPasswordOutput = {
    token: string
}
