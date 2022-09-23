import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { CustomError } from '../../exceptions/CustomError'

export class DeactivePost {
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

    async execute(input: DeactivePostInput): Promise<void> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsPost = await this.postRepository.find(input.id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        if (!existsPost.is_active) throw new CustomError(422, 'post already deactivated')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        if (existsUser.type === 'user') throw new CustomError(403, 'not allowed')
        const IS_ACTIVE = false
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

type DeactivePostInput = {
    id: string,
    token: string
}