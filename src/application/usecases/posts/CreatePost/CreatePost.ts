import { randomUUID } from 'crypto'
import { Post } from '../../../../domain/entities/Post'
import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { CustomError } from '../../../exceptions/CustomError'
import { CreatePostInput } from './CreatePostOutput'

export class CreatePost {
    constructor(
    readonly postRepository: PostRepository,
    readonly userRepository: UserRepository
    ) {}

    async execute(input: CreatePostInput): Promise<void> {
        if (!input.title) throw new CustomError(400, 'title is required')
        if (!input.description) throw new CustomError(400, 'description is required')
        if (!input.video_id) throw new CustomError(400, 'video_id is required')
        if (!input.user_id) throw new CustomError(400, 'user_id is required')
        const existsUser = await this.userRepository.find(input.user_id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        const isActive = existsUser.type !== 'user' || false
        const post = new Post(
            randomUUID(),
            input.user_id,
            input.video_id,
            input.title,
            input.description,
            true,
            isActive
        )
        await this.postRepository.save(post)
    }
}
