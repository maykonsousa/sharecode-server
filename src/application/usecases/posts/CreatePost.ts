import { randomUUID } from 'crypto'
import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
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
        const IS_ACTIVE = existsUser.type !== 'user' || false
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
