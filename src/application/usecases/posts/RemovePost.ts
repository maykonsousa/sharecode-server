import { randomUUID } from 'crypto'
import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Sign } from '../../../infra/adapters/Sign'
import { Validator } from '../../../infra/adapters/Validator'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class RemovePost {
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

    async execute(input: RemovePostInput): Promise<void> {
        this.validator.isMissingParam(this.fieldsRequired, input)
        const existsPost = await this.postRepository.find(input.id)
        if (!existsPost) throw new NotFoundError('post not found')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new UnauthorizedError('invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new NotFoundError('user not found')
        if (existsUser.type !== 'user') {
            await this.postRepository.delete(existsPost.id)
            return
        }
        const ADMIN_USER_ID = process.env.ADMIN_USER_ID
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
