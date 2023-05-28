import { randomUUID } from 'crypto'
import { Post } from '../../../core/domain/Post'
import { PostRepository } from '../../../core/domain/PostRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Validator } from '../../../infra/adapters/Validator'
import { NotFoundError } from '../../exceptions/NotFoundError'

export class CreatePost {
    readonly fieldsRequired: string[]

    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly validator: Validator
    ) { 
        this.fieldsRequired = [
            'title',
            'description',
            'video_id',
            'user_id'
        ]
    }

    async execute(input: CreatePostInput): Promise<CreatePostOutput> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsUser = await this.userRepository.find(input.user_id)
        if (!existsUser) throw new NotFoundError('user not found')
        const IS_ACTIVE = existsUser.getRule() !== 'user' || false
        const IS_PRIVATE = false
        const post = new Post(
            randomUUID(),
            input.user_id,
            input.video_id,
            input.title,
            input.description,
            IS_PRIVATE,
            IS_ACTIVE
        )
        await this.postRepository.save(post)
        return {
            id: post.id
        }
    }
}

type CreatePostInput = {
    user_id: string
    video_id: string
    title: string
    description: string
    is_private?: boolean
}

type CreatePostOutput = {
    id: string
}
