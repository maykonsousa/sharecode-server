import nodemailer, { Transporter } from 'nodemailer'
import { Message } from '../../domain/entities/Message'

import { Mail } from './Mail'

export class Nodemailer implements Mail {
    private transporter: Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'catharine97@ethereal.email',
                pass: 'h52VMtkuhBwC5bVkfg'
            }
        })
    }

    async send(message: Message): Promise<void> {
        await this.transporter.sendMail({
            from: message.from,
            to: message.to,
            subject: message.subject,
            html: message.content,
        })
        this.transporter.close()
    }
}
