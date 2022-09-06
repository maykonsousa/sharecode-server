import { randomUUID } from 'crypto'
import { User } from '../../../../domain/entities/User'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Hash } from '../../../../infra/adapters/Hash'
import { CustomError } from '../../../exceptions/CustomError'
import { CreateUserInput } from './CreateUserInput'

export class CreateUser {
    constructor(readonly userRepository: UserRepository, readonly hash: Hash) {}

    async execute(input: CreateUserInput): Promise<void> {
        if (!input.gh_username) throw new CustomError(400, 'gh_username is required')
        if (!input.name) throw new CustomError(400, 'name is required')
        if (!input.email) throw new CustomError(400, 'email is required')
        if (!input.password) throw new CustomError(400, 'password is required')
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
    }
}
