import { Post } from '../../../domain/entities/Post'
import { PostRepository } from '../../../domain/repositories/PostRepository'
import { prismaClient } from '../../database/prisma/client'

export class PostRepositoryPrisma implements PostRepository {
    async save(post: Post): Promise<void> {
        const data = {
            id: post.id,
            user_id: post.user_id,
            video_id: post.video_id,
            title: post.title,
            description: post.description,
            is_private: post.is_private,
            is_active: post.is_active,
        }
        await prismaClient.posts.create({ data })
    }

    async update(post: Post): Promise<void> {
        const data = {
            id: post.id,
            user_id: post.user_id,
            video_id: post.video_id,
            title: post.title,
            description: post.description,
            is_private: post.is_private,
            is_active: post.is_active,
        }
        await prismaClient.posts.update({
            where: {
                id: post.id
            },
            data
        })
    }

    async findPublicPost(): Promise<Post[]> {
        const postsData = await prismaClient.posts.findMany({
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
        const postData = await prismaClient.posts.findFirst({
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
        const postData = await prismaClient.posts.findFirst({
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

    async findByUser(userId: string): Promise<Post> {
        const postData = await prismaClient.posts.findFirst({
            where: {
                user_id: userId
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

    async findAll(): Promise<Post[]> {
        const postsData = await prismaClient.posts.findMany()
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

    async remove(id: string): Promise<void> {
        await prismaClient.posts.delete({
            where: {
                id
            }
        })
    }

    async clean(): Promise<void> {
        await prismaClient.posts.deleteMany({})
    }
}
