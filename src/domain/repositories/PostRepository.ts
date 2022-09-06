import { Post } from '../../domain/entities/Post'

export interface PostRepository {
    save(post: Post): Promise<void>
    find(id: string): Promise<Post>
    findByURL(url: string): Promise<Post>
    findByUser(userId: string): Promise<Post>
    findAll(): Promise<Post[]>
    findPublicPost(): Promise<Post[]>
    update(post: Post): Promise<void>
    remove(id: string): Promise<void>
    clean(): Promise<void>
}