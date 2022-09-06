import { User } from '../../../domain/entities/User'
import { UserRepository } from '../../../domain/repositories/UserRepository'
import { prismaClient } from '../../database/prisma/client'

export class UserRepositoryPrisma implements UserRepository {
    async save(user: User): Promise<void> {
        const data = {
            id: user.id,
            gh_username: user.gh_username,
            name: user.name,
            email: user.email.getValue(),
            password: user.password.getValue(),
            type: user.type
        }
        await prismaClient.user.create({ data })
    }

    async findAll(): Promise<User[]> {
        const usersData = await prismaClient.user.findMany()
        const users: User[] = []
        for (const userData of usersData) {
            users.push(
                new User(
                    userData.id,
                    userData.gh_username,
                    userData.name,
                    userData.email,
                    userData.password,
                    userData.type
                )
            )
        }
        return users
    }

    async find(id: string): Promise<User> {
        const userData = await prismaClient.user.findFirst({
            where: { id }
        })
        if (!userData) return undefined
        return new User(
            userData.id,
            userData.gh_username,
            userData.name,
            userData.email,
            userData.password,
            userData.type
        )
    }

    async findByEmail(email: string): Promise<User> {
        const userData = await prismaClient.user.findFirst({
            where: { email },
        })
        if (!userData) return undefined
        return new User(
            userData.id,
            userData.gh_username,
            userData.name,
            userData.email,
            userData.password,
            userData.type
        )
    }

    async update(user: User): Promise<void> {
        const data = {
            gh_username: user.gh_username,
            name: user.name,
            email: user.email.getValue(),
            password: user.password.getValue(),
            type: user.type
        }
        await prismaClient.user.update({
            where: {
                id: user.id,
            }, 
            data
        })
    }

    async delete(id: string): Promise<void> {
        await prismaClient.user.delete({ where: { id } })
    }

    async clean(): Promise<void> {
        await prismaClient.user.deleteMany()
    }
}
