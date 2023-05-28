import { Email } from './value-objects/Email'
import { Password } from './value-objects/Password'
import { Rule } from './value-objects/Rule'

export class User {
    email: Email
    password: Password
    private rule: string

    constructor(
        readonly id: string,
        readonly gh_username: string,
        readonly name: string,
        email: string,
        password: string,
    ) {
        this.validate()
        this.email = new Email(email)
        this.password = new Password(password)
        this.rule = new Rule('user').getValue()
    }

    private validate() {
        if (!this.id) throw new Error('id is required')
        if (!this.gh_username) throw new Error('gh_username is required')
        if (!this.name) throw new Error('name is required')
    }

    updateRule(rule: string): void {
        this.rule = new Rule(rule).getValue()
    }

    getRule(): string {
        return this.rule
    }
}
