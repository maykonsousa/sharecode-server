import jsonwebtoken from 'jsonwebtoken'

import { Sign } from './Sign'

export class JSONWebToken implements Sign {
    encode(payload: object, expiresIn: string | number): string {
        return jsonwebtoken.sign(payload, process.env.JWT_KEY, {
            expiresIn
        })
    }

    decode(token: string): any {
        return jsonwebtoken.verify(token, process.env.JWT_KEY)
    }
}
