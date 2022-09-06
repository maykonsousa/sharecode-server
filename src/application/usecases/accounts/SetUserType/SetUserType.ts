import { User } from '../../../../domain/entities/User'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { CustomError } from '../../../exceptions/CustomError'
import { SetUserTypeInput } from './SetUserTypeInput'

export class SetUserType {
    constructor(readonly userRepository: UserRepository) { }

    async execute(input: SetUserTypeInput): Promise<void> {
        if (!input.id) throw new CustomError(400, 'id is required')
        if (!input.type) throw new CustomError(400, 'type is required')
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new CustomError(404, 'user not found')
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
