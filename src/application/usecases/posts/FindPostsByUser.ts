import 'dotenv/config'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { CustomError } from '../../exceptions/CustomError'

export class FindPostsByUser {
    private readonly fieldsRequired: string[]

    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly sign: Sign,
        private readonly validator: Validator
    ) { 
        this.fieldsRequired = [
            'id',
            'token'
        ]
    }

    async execute(input: FindPostsByUserInput): Promise<FindPostsByUserOutput[]> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        if (existsUser.id !== id) throw new CustomError(403, 'not allowed')
        const posts = await this.postRepository.findByUser(existsUser.id)
        const output: FindPostsByUserOutput[] = []
        for (const post of posts) {
            output.push(
                {
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    user_id: post.user_id,
                    isActive: post.is_active,
                    isPrivate: post.is_private
                }
            )
        }
        return output
    }
}

type FindPostsByUserInput = {
    id: string
    token: string
}

type FindPostsByUserOutput = {
    id: string
    title: string
    description: string
    user_id: string
    isActive: boolean
    isPrivate: boolean
}
