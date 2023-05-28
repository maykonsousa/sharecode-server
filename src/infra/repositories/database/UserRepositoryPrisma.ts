import { User } from '../../../core/domain/User'
import { UserRepository } from '../../../core/domain/UserRepository'
import { PrismaDBAdapter } from '../../database/PrismaDBAdapter'

export class UserRepositoryPrisma implements UserRepository {
    constructor(
        readonly prismaClient: PrismaDBAdapter
    ) { }
    
    async save(user: User): Promise<void> {
        const connection = this.prismaClient.getConnection()
        const data = {
            id: user.id,
            gh_username: user.gh_username,
            name: user.name,
            email: user.email.getValue(),
            password: user.password.getValue(),
            type: user.rule
        }
        await connection.user.create({ data })
    }

    async findAll(): Promise<User[]> {
        const connection = this.prismaClient.getConnection()
        const usersData = await connection.user.findMany()
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
        const connection = this.prismaClient.getConnection()
        const userData = await connection.user.findFirst({
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
        const connection = this.prismaClient.getConnection()
        const userData = await connection.user.findFirst({
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
        const connection = this.prismaClient.getConnection()
        const data = {
            gh_username: user.gh_username,
            name: user.name,
            email: user.email.getValue(),
            password: user.password.getValue(),
            type: user.rule
        }
        await connection.user.update({
            where: {
                id: user.id,
            }, 
            data
        })
    }

    async delete(id: string): Promise<void> {
        const connection = this.prismaClient.getConnection()
        await connection.user.delete({ where: { id } })
    }

    async clean(): Promise<void> {
        const connection = this.prismaClient.getConnection()
        await connection.user.deleteMany()
    }
}
