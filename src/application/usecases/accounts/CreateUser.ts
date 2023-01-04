import { randomUUID } from 'crypto'
import { User } from '../../../domain/entities/User'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Queue } from '../../../infra/queue/Queue'
import { CustomError } from '../../exceptions/CustomError'

export type CreateUserInput = {
    gh_username: string
    name: string
    email: string
    password: string
}

type CreateUserOutput = {
    id: string
}

export class CreateUser {
    constructor(
        readonly userRepository: UserRepository,
        readonly hash: Hash,
        readonly queue: Queue
    ) { }

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        const user = new User(
            randomUUID(),
            input.gh_username,
            input.name,
            input.email,
            input.password
        )
        const existsUser = await this.userRepository.findByEmail(user.email.getValue())
        if (existsUser) throw new CustomError(422, 'user already exists')
        const encryptedPassword = this.hash.encrypt(user.password.getValue())
        user.password.setValue(encryptedPassword)
        await this.userRepository.save(user)
        await this.queue.publish('userCreated', {
            id: user.id,
            name: user.name,
            email: user.email.getValue()
        })
        return {
            id: user.id
        }
    }
}
