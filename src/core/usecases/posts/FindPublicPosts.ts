import { PostRepository } from '../../../core/domain/PostRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Pagination } from '../../../infra/adapters/Pagination'
import { Sign } from '../../../infra/adapters/Sign'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class FindPublicPosts {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly sign: Sign,
        readonly pagination: Pagination
    ) { }

    async execute(input: FindPublicPostsInput): Promise<FindPublicPostsOutput[]> {
        if (!input.token) throw new MissingParamError('token is required')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new UnauthorizedError('invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new NotFoundError('user not found')
        const posts = await this.postRepository.findPublicPosts()
        const output: FindPublicPostsOutput[] = []
        for (const post of posts) {
            const ownerUser = await this.userRepository.find(post.user_id)
            if (!ownerUser) throw new NotFoundError('user not found')
            output.push(
                {
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    video_id: post.video_id,
                    user_id: post.user_id,
                    user_name: ownerUser.name,
                    isActive: post.is_active,
                    isPrivate: post.is_private
                }
            )
        }
        return this.pagination.execute(output, input.page, input.limit)
    }
}

type FindPublicPostsInput = {
    page?: number
    limit?: number
    token: string
}

type FindPublicPostsOutput = {
    id: string
    title: string
    description: string
    video_id: string
    user_id: string
    user_name: string
    isActive: boolean
    isPrivate: boolean
}
