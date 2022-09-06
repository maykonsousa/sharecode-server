import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'

export class PostRepositoryMemory implements PostRepository {
    posts: Post[] = []

    async update(post: Post): Promise<void> {
        const existsPost = await this.find(post.id)
        if (!existsPost) throw new Error('post not found')
        existsPost.title = post.title
        existsPost.description = post.description
        existsPost.is_active = post.is_active
        existsPost.is_private = post.is_private
    }

    async save(post: Post): Promise<void> {
        this.posts.push(post)
    }

    async findAll(): Promise<Post[]> {
        return this.posts
    }

    async findPublicPost(): Promise<Post[]> {
        return this.posts.filter((post) => post.is_active && !post.is_private)
    }

    async find(id: string): Promise<Post | undefined> {
        return this.posts.find((post) => post.id === id)
    }

    async findByURL(url: string): Promise<Post | undefined> {
        return this.posts.find((post) => post.video_id === url)
    }

    async findByUser(userId: string): Promise<Post | undefined> {
        return this.posts.find((post) => post.user_id === userId)
    }

    async remove(id: string): Promise<void> {
        const newPosts = this.posts.filter((post) => post.id !== id)
        this.posts = newPosts
    }

    async clean(): Promise<void> {
        this.posts = []
    }
}