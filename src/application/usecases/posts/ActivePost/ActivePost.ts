import { Post } from '../../../../domain/entities/Post'
import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { TokenRepository } from '../../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'

export class ActivePost {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly sign: Sign
    ) { }

    async execute(id: string): Promise<void> {
        if (!id) throw new CustomError(400, 'id is required')
        const existsPost = await this.postRepository.find(id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        const post = new Post(
            existsPost.id,
            existsPost.user_id,
            existsPost.video_id,
            existsPost.title,
            existsPost.description,
            existsPost.is_private,
            true
        )
        await this.postRepository.update(post)
    }
}
