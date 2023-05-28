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
        readonly type: string = 'user'
    ) {
        this.validate()
        this.email = new Email(email)
        this.password = new Password(password)
    }

    private validate() {
        if (!this.id) throw new Error('id is required')
        if (!this.gh_username) throw new Error('gh_username is required')
        if (!this.name) throw new Error('name is required')
    }
}
