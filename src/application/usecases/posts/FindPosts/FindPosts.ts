import 'dotenv/config'
import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'

export class FindPosts {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly sign: Sign
    ) { }

    async execute(input: FindPostsInput): Promise<FindPostsOutput[]> {
        let id = null
        try {
            id = this.sign.decode(input.token).id
        } catch (err) {
            throw new CustomError(401, 'invalid token')
        }
        const existsUser = await this.userRepository.find(id)
        if (!existsUser) throw new CustomError(404, 'user not found')
        if (existsUser.type === 'user') throw new CustomError(403, 'not allowed')
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
        return output
    }
}

type FindPostsInput = {
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
