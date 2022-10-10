import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { PrismaDBAdapter } from '../../database/PrismaDBAdapter'

export class PostRepositoryPrisma implements PostRepository {
    constructor(
        readonly prismaClient: PrismaDBAdapter
    ) { }

    async save(post: Post): Promise<void> {
        const connection = this.prismaClient.getConnection()
        const data = {
            id: post.id,
            user_id: post.user_id,
            video_id: post.video_id,
            title: post.title,
            description: post.description,
            is_private: post.is_private,
            is_active: post.is_active,
        }
        await connection.posts.create({ data })
    }

    async update(post: Post): Promise<void> {
        const connection = this.prismaClient.getConnection()
        const data = {
            id: post.id,
            user_id: post.user_id,
            video_id: post.video_id,
            title: post.title,
            description: post.description,
            is_private: post.is_private,
            is_active: post.is_active,
        }
        await connection.posts.update({
            where: {
                id: post.id
            },
            data
        })
    }

    async findPublicPosts(): Promise<Post[]> {
        const connection = this.prismaClient.getConnection()
        const postsData = await connection.posts.findMany({
            where: {
                is_private: false,
                is_active: true
            }
        })
        const posts: Post[] = []
        for (const postData of postsData) {
            posts.push(
                new Post(
                    postData.id,
                    postData.user_id,
                    postData.video_id,
                    postData.title,
                    postData.description,
                    postData.is_private,
                    postData.is_active
                )
            )
        }
        return posts
    }

    async find(id: string): Promise<Post> {
        const connection = this.prismaClient.getConnection()
        const postData = await connection.posts.findFirst({
            where: {
                id
            }
        })
        if (!postData) return
        return new Post(
            postData.id,
            postData.user_id,
            postData.video_id,
            postData.title,
            postData.description,
            postData.is_private,
            postData.is_active
        )
    }
    async findByURL(url: string): Promise<Post> {
        const connection = this.prismaClient.getConnection()
        const postData = await connection.posts.findFirst({
            where: {
                video_id: url
            }
        })
        if (!postData) return
        return new Post(
            postData.id,
            postData.user_id,
            postData.video_id,
            postData.title,
            postData.description,
            postData.is_private,
            postData.is_active
        )
    }

    async findByUser(userId: string): Promise<Post[]> {
        const connection = this.prismaClient.getConnection()
        const postsData = await connection.posts.findMany({
            where: {
                user_id: userId
            }
        })
        if (!postsData) return
        const posts: Post[] = []
        for (const postData of postsData) {
            posts.push(
                new Post(
                    postData.id,
                    postData.user_id,
                    postData.video_id,
                    postData.title,
                    postData.description,
                    postData.is_private,
                    postData.is_active
                )
            )
        }
        return posts
    }

    async findAll(): Promise<Post[]> {
        const connection = this.prismaClient.getConnection()
        const postsData = await connection.posts.findMany()
        const posts: Post[] = []
        for (const postData of postsData) {
            posts.push(
                new Post(
                    postData.id,
                    postData.user_id,
                    postData.video_id,
                    postData.title,
                    postData.description,
                    postData.is_private,
                    postData.is_active
                )
            )
        }
        return posts
    }

    async delete(id: string): Promise<void> {
        const connection = this.prismaClient.getConnection()
        connection.posts.delete({
            where: {
                id
            }
        })
    }

    async clean(): Promise<void> {
        const connection = this.prismaClient.getConnection()
        connection.posts.deleteMany({})
    }
}
