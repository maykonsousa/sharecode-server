import { UserRepository } from '../../domain/UserRepository'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { ValidationMessages } from '../../exceptions/ValidationMessages'

export class GetUser {
    constructor(
        private readonly userRepository: UserRepository
    ) { }

    async execute(userId: string): Promise<GetUserOutput> {
        const user = await this.userRepository.find(userId)
        if (!user) throw new NotFoundError(ValidationMessages.USER_NOT_FOUND)
        return {
            id: user.id,
            gh_username: user.gh_username,
            name: user.name,
            email: user.email
        }
    }
}

export type GetUserOutput = {
    id: string
    gh_username: string
    name: string
    email: string
}
