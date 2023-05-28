import { randomUUID } from 'crypto'
import { User } from '../../../core/domain/User'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Queue } from '../../../infra/queue/Queue'
import { CustomError } from '../../exceptions/CustomError'

export class CreateUser {
    constructor(
        readonly userRepository: UserRepository,
        readonly hash: Hash,
        readonly queue: Queue
    ) { }

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        const user = User.create(
            randomUUID(),
            input.gh_username,
            input.name,
            input.email,
            input.password
        )
        const existingUser = await this.userRepository.findByEmail(user.email)
        if (existingUser) throw new CustomError(422, 'user already exists')
        const encryptedPassword = this.hash.encrypt(user.getPassword())
        user.updateEncrypedPassword(encryptedPassword)
        await this.userRepository.save(user)
        await this.queue.publish('userCreated', {
            id: user.id,
            name: user.name,
            email: user.email
        })
        return {
            id: user.id
        }
    }
}

export type CreateUserInput = {
    gh_username: string
    name: string
    email: string
    password: string
}

type CreateUserOutput = {
    id: string
}
