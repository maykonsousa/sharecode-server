import { randomUUID } from 'crypto'
import { User } from '../../../domain/entities/User'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Hash } from '../../../infra/adapters/Hash'
import { Validator } from '../../../infra/adapters/Validator'
import { CustomError } from '../../exceptions/CustomError'

export class CreateSuperUser {
    readonly fieldsRequired: string[]
    
    constructor(
        readonly userRepository: UserRepository, 
        readonly hash: Hash,
        readonly validator: Validator
    ) {
        this.fieldsRequired = [
            'gh_username',
            'name',
            'email',
            'password'
        ]
    }

    async execute(input: CreateSuperUserInput): Promise<void> {
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
            'admin'
        )        
        await this.userRepository.save(user)
    }
}

export type CreateSuperUserInput = {
    gh_username: string
    name: string
    email: string
    password: string
}
