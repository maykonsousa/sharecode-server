import { randomUUID } from 'crypto'
import { CurrentDate } from '../../../domain/entities/CurrentDate'
import { Message } from '../../../domain/entities/Message'
import { Token } from '../../../domain/entities/Token'
import { TokenRepository } from '../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Mail } from '../../../infra/adapters/Mail'
import { Sign } from '../../../infra/adapters/Sign'
import { Template } from '../../../infra/adapters/Template'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class ForgotPassword {
    constructor(
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly sign: Sign,
        readonly mail: Mail,
        readonly template: Template
    ) { }

    async execute(email: string): Promise<ForgotPasswordOutput> {
        if (!email) throw new MissingParamError('email is required')
        const existsUser = await this.userRepository.findByEmail(email)
        if (!existsUser) return
        const encodedToken = this.sign.encode({
            id: existsUser.id,
            type: existsUser.type
        }, '15m')
        const currentDate = new CurrentDate()
        const expiredAt = currentDate.addMinutes(15)
        const token = new Token(
            randomUUID(),
            encodedToken,
            existsUser.id,
            'forgot_password',
            false,
            expiredAt
        )
        const html = await this.template.render('public/reset.ejs', {
            name: existsUser.name,
            url: `http://localhost:3000/reset_password?token=${token.id}`
        })
        const message = new Message(
            {
                name: 'app',
                address: 'app@test.com'
            },
            {
                name: existsUser.name,
                address: existsUser.email.getValue()
            },
            'Reset de senha',
            html
        )
        await this.tokenRepository.save(token)
        await this.mail.send(message)
        return {
            token: token.id
        }
    }
}

export type ForgotPasswordOutput = {
    token: string
}
