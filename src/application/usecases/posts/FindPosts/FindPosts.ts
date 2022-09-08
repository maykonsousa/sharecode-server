import { PostRepository } from '../../../../domain/repositories/PostRepository'

export class FindPosts {
    constructor(
        readonly postRepository: PostRepository
    ) { }

    async execute(): Promise<FindPostsOutput[]> {
        const posts = await this.postRepository.findAll()
        const output: FindPostsOutput[] =[]
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

type FindPostsOutput = {
    id: string
    title: string
    description: string
    user_id: string
    isActive: boolean
    isPrivate: boolean
}
