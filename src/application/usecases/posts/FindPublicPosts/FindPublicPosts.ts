import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { UserRepository } from '../../../../domain/repositories/UserRepository'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'

export class FindPublicPosts {
    constructor(
        readonly postRepository: PostRepository,
        readonly userRepository: UserRepository,
        readonly sign: Sign
    ) {}

    async execute(input: FindPublicPostsInput): Promise<FindPublicPostsOutput[]> {
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
        return output
    }
}

type FindPublicPostsInput = {
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
