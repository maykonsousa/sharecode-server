import 'dotenv/config'
import { PostRepository } from '../../../core/domain/PostRepository'
import { UserRepository } from '../../../core/domain/UserRepository'
import { Pagination } from '../../../infra/adapters/Pagination'
import { Sign } from '../../../infra/adapters/Sign'
import { CustomError } from '../../exceptions/CustomError'
import { MissingParamError } from '../../exceptions/MissingParamError'
import { NotFoundError } from '../../exceptions/NotFoundError'
import { UnauthorizedError } from '../../exceptions/UnauthorizedError'

export class FindPosts {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly sign: Sign,
        readonly pagination: Pagination
    ) { }

    async execute(input: FindPostsInput): Promise<FindPostsOutput[]> {
        if (!input.token) throw new MissingParamError('token is required')
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new UnauthorizedError('invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new NotFoundError('user not found')
        if (existsUser.getRule() === 'user') throw new CustomError(403, 'not allowed')
        const posts = await this.postRepository.findAll()
        const output: FindPostsOutput[] = []
        for (const post of posts) {
            output.push({
                id: post.id,
                title: post.title,
                description: post.description,
                user_id: post.user_id,
                isActive: post.is_active,
                isPrivate: post.is_private
            })
        }
        return this.pagination.execute(output, input.page, input.limit)
    }
}

type FindPostsInput = {
    page?: number
    limit?: number
    token: string
}

type FindPostsOutput = {
    id: string
    title: string
    description: string
    user_id: string
    isActive: boolean
    isPrivate: boolean
}
