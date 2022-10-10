import { randomUUID } from 'crypto'
import { User } from '../../../domain/entities/User'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Validator } from '../../../infra/adapters/Validator'
import { Queue } from '../../../infra/queue/Queue'
import { CustomError } from '../../exceptions/CustomError'

export class CreateUser {
    readonly fieldsRequired: string[]

    constructor(
        readonly userRepository: UserRepository,
        readonly hash: Hash,
        readonly validator: Validator,
        readonly queue: Queue
    ) { 
        this.fieldsRequired = [
            'gh_username',
            'name',
            'email',
            'password'
        ]
    }

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsUser = await this.userRepository.findByEmail(input.email)
        if (existsUser) throw new CustomError(422, 'user already exists')
        const password = this.hash.encrypt(input.password)
        const user = new User(
            randomUUID(),
            input.gh_username,
            input.name,
            input.email,
            password,
            'user'
        )
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

export type CreateUserInput = {
    gh_username: string
    name: string
    email: string
    password: string
}

type CreateUserOutput = {
    id: string
}
