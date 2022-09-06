import bcrypt from 'bcrypt'

import { Hash } from './Hash'

export class Bcrypt implements Hash {
    encrypt(password: string): string {
        const SALT_OR_ROUNDS = 8
        return bcrypt.hashSync(password, SALT_OR_ROUNDS)
    }

    decrypt(password: string, encryptedPassword: string): boolean {
        return bcrypt.compareSync(password, encryptedPassword)
    }
}
