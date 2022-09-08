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

    async execute(input: ActivePostInput): Promise<void> {
        if (!input.id) throw new CustomError(400, 'id is required')
        if (!input.token) throw new CustomError(400, 'token is required')
        const existsPost = await this.postRepository.find(input.id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        if (existsPost.is_active) throw new CustomError(422, 'post already activated')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsToken = await this.userRepository.find(id)
        if (!existsToken) throw new CustomError(404, 'user not found')
        if (existsToken.type === 'user') throw new CustomError(403, 'not allowed')
        const IS_ACTIVE = true
        const post = new Post(
            existsPost.id,
            existsPost.user_id,
            existsPost.video_id,
            existsPost.title,
            existsPost.description,
            existsPost.is_private,
            IS_ACTIVE
        )
        await this.postRepository.update(post)
    }
}

type ActivePostInput = {
    id: string,
    token: string
}
