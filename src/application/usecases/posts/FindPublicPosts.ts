import { PostRepository } from '../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { Pagination } from '../../../infra/adapters/Pagination'
import { Sign } from '../../../infra/adapters/Sign'
import { CustomError } from '../../exceptions/CustomError'
import { MissingParamError } from '../../exceptions/MissingParamError'

export class FindPublicPosts {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly sign: Sign,
        private readonly pagination: Pagination
    ) { }

    async execute(input: FindPublicPostsInput): Promise<FindPublicPostsOutput[]> {
        if (!input.token) throw new MissingParamError('token is required')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        const posts = await this.postRepository.findPublicPosts()
        const output: FindPublicPostsOutput[] = []
        for (const post of posts) {
            output.push(
                {
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    user_id: post.user_id,
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
    user_id: string
    isActive: boolean
    isPrivate: boolean
}