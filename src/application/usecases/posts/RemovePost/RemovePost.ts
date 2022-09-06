import { PostRepository } from '../../../../domain/repositories/PostRepository'
import { Sign } from '../../../../infra/adapters/Sign'
import { CustomError } from '../../../exceptions/CustomError'

export class RemovePost {
    constructor(
        readonly postRepository: PostRepository,
        readonly token: Sign
    ) { }

    async execute(id: string): Promise<void> {
        if (!id) throw new CustomError(400, 'id is required')
        const existsPost = await this.postRepository.find(id)
        if (!existsPost) throw new CustomError(404, 'post not found')
        await this.postRepository.remove(existsPost.id)
    }
}
