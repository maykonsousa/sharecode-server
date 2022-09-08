import { CustomError } from '../../../exceptions/CustomError'
import { Post } from '../../../../domain/entities/Post'
import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { Sign } from '../../../../infra/adapters/Sign'
import { TokenRepository } from '../../../../domain/repositories/TokenRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'

export class RemovePost {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly tokenRepository: TokenRepository,
        readonly sign: Sign
    ) { }

    async execute(input: RemovePostInput): Promise<void> {
        if (!input.id) throw new CustomError(400, 'id is required')
        if (!input.token) throw new CustomError(400, 'token is required')
        const existsPost = await this.postRepository.find(input.id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        if (existsUser.type !== 'user') {
            await this.postRepository.delete(existsPost.id)
            return
        }
        const ADMIN_USER_ID = '4aaa45f8-6035-4fc4-adf2-35ba1fa0bafd'
        const IS_PRIVATE = true
        const IS_ACTIVE = false
        const post = new Post(
            existsPost.id,
            ADMIN_USER_ID,
            existsPost.video_id,
            existsPost.title,
            existsPost.description,
            IS_PRIVATE,
            IS_ACTIVE
        )
        await this.postRepository.update(post)
    }
}

type RemovePostInput = {
    id: string,
    token: string
}
