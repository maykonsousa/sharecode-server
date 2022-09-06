import jsonwebtoken from 'jsonwebtoken'

import { Sign } from './Sign'

export class JSONWebToken implements Sign {
    encode(subject: string, expiresIn: string | number): string {
        return jsonwebtoken.sign({}, process.env.JWT_KEY, {
            subject,
            expiresIn
        })
    }

    decode(token: string): any {
        return jsonwebtoken.verify(token, process.env.JWT_KEY)
    }
}
