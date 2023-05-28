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
            'type'
        ]
    }

    async execute(input: SetUserTypeInput): Promise<void> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new NotFoundError('user not found')
        const user = new User(
            existsUser.id,
            existsUser.gh_username,
            existsUser.name,
            existsUser.email.getValue(),
            existsUser.password.getValue(),
            input.type
        )
        await this.userRepository.update(user)
    }
}

type SetUserTypeInput = {
    id: string
    type: string
}
