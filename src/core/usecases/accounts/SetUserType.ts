import { User } from '../../../core/domain/User'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Validator } from '../../../infra/adapters/Validator'
import { Rule } from '../../domain/value-objects/Rule'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class SetUserType {
    readonly fieldsRequired: string[]

    constructor(
        readonly userRepository: UserRepository,
        readonly validator: Validator
    ) { }

    async execute(input: SetUserTypeInput): Promise<void> {
        if (!input.id) throw new MissingParamError(ValidationMessages.REQUIRED_USER_ID)
        if (!input.rule) throw new MissingParamError(ValidationMessages.REQUIRED_RULE)
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new NotFoundError('user not found')
        const rule = new Rule(input.rule).getValue()
        const user = User.buildExistingUser(
            existsUser.id,
            existsUser.gh_username,
            existsUser.name,
            existsUser.email,
            existsUser.getPassword(),
            rule
        )
        await this.userRepository.update(user)
    }
}

type SetUserTypeInput = {
    id: string
    rule: string
}
