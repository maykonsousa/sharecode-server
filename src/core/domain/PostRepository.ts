import { Post } from '../../core/domain/Post'

export interface PostRepository {
    save(post: Post): Promise<void>
    find(id: string): Promise<Post>
    findByURL(url: string): Promise<Post>
    findByUser(userId: string): Promise<Post[]>
    findAll(): Promise<Post[]>
    findPublicPosts(): Promise<Post[]>
    update(post: Post): Promise<void>
    delete(id: string): Promise<void>
    clean(): Promise<void>
}
