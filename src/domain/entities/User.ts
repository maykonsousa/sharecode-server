import { Email } from './value-objects/Email'
import { Password } from './value-objects/Password'

export class User {
    email: Email
    password: Password

    constructor(
        readonly id: string,
        readonly gh_username: string,
        readonly name: string,
        email: string,
        password: string,
        readonly type: string
    ) {
        this.email = new Email(email)
        this.password = new Password(password)
    }
}
