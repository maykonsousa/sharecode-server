import { Email } from './value-objects/Email'
import { Password } from './value-objects/Password'
import { Rule } from './value-objects/Rule'

export class User {

    private constructor(
        readonly id: string,
        readonly gh_username: string,
        readonly name: string,
        readonly email: string,
        private password: string,
        private rule: string
    ) {
        this.validate()
    }

    private validate() {
        if (!this.id) throw new Error('id is required')
        if (!this.gh_username) throw new Error('gh_username is required')
        if (!this.name) throw new Error('name is required')
    }

    static create(
        id: string,
        gh_username: string,
        name: string,
        email: string,
        password: string
    ): User {
        return new User(
            id,
            gh_username,
            name,
            new Email(email).getValue(),
            new Password(password).getValue(),
            new Rule('user').getValue()
        )
    }

    static buildExistingUser(
        id: string,
        gh_username: string,
        name: string,
        email: string,
        password: string,
        rule: string
    ): User {
        return new User(
            id,
            gh_username,
            name,
            email,
            password,
            rule
        )
    }

 

    updateRule(rule: string): void {
        this.rule = new Rule(rule).getValue()
    }

    getRule(): string {
        return this.rule
    }

    updatePassword(password: string): void {
        this.password = new Password(password).getValue()
    }

    updateEncrypedPassword(password: string): void {
        this.password = password
    }

    getPassword(): string {
        return this.password
    }
}
