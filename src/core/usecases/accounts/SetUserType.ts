import { User } from '../../../core/domain/User'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Validator } from '../../../infra/adapters/Validator'
import { NotFoundError } from '../../exceptions/NotFoundError'

export class SetUserType {
    readonly fieldsRequired: string[]

    constructor(
        readonly userRepository: UserRepository,
        readonly validator: Validator
    ) { 
        this.fieldsRequired = [
            'id',
            'rule'
        ]
    }

    async execute(input: SetUserTypeInput): Promise<void> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new NotFoundError('user not found')
        const user = User.create(
            existsUser.id,
            existsUser.gh_username,
            existsUser.name,
            existsUser.email,
            existsUser.getPassword()
        )
        user.updateRule(input.rule)
        await this.userRepository.update(user)
    }
}

type SetUserTypeInput = {
    id: string
    rule: string
}
