import { Post } from '../../../core/domain/Post'
import { PostRepository } from '../../../core/domain/PostRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { CustomError } from '../../exceptions/CustomError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class ActivePost {
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

    async execute(input: ActivePostInput): Promise<void> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsPost = await this.postRepository.find(input.id)
        if (!existsPost) throw new NotFoundError('post not found')
        if (existsPost.is_active) throw new CustomError(422, 'post already activated')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new UnauthorizedError('invalid token')
        }
        const existingUser = await this.userRepository.find(id)
        console.log(existingUser)
        if (!existingUser) throw new NotFoundError('user not found')
        if (existingUser.getRule() === 'user') throw new CustomError(403, 'not allowed')
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
