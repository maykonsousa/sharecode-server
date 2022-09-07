import { Post } from '../../../../domain/entities/Post'
import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { CustomError } from '../../../exceptions/CustomError'

export class DeactivePost {
    constructor(
        readonly postRepository: PostRepository
    ) {}


    async execute(id: string): Promise<void> {
        const existsPost = await this.postRepository.find(id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        const post = new Post(
            existsPost.id,
            existsPost.user_id,
            existsPost.video_id,
            existsPost.title,
            existsPost.description,
            existsPost.is_private,
            false
        )
        await this.postRepository.update(post)
    }
}
