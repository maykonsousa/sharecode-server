import 'dotenv/config'
import { PostRepository } from '../../../core/domain/PostRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { CustomError } from '../../exceptions/CustomError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class FindPostsByUser {
    readonly fieldsRequired: string[]

    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly sign: Sign,
        readonly validator: Validator
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
            throw new UnauthorizedError('invalid token')
        }
        const existsUser = await this.userRepository.find(input.id)
        if (!existsUser) throw new NotFoundError('user not found')
        if (existsUser.id !== id) throw new CustomError(403, 'not allowed')
        const posts = await this.postRepository.findByUser(existsUser.id)
        const output: FindPostsByUserOutput[] = []
        for (const post of posts) {
            const ownerUser = await this.userRepository.find(post.user_id)
            if (!ownerUser) throw new NotFoundError('user not found')
            output.push(
                {
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    video_id: post.video_id,
                    user_id: post.user_id,
                    user_name: ownerUser.name,
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
    video_id: string
    user_name: string
    user_id: string
    isActive: boolean
    isPrivate: boolean
}
