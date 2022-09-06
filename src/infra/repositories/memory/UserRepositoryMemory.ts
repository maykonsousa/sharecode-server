import { User } from '../../../domain/entities/User'
import { UserRepository } from '../../../domain/repositories/UserRepository'

export class UserRepositoryMemory implements UserRepository {
    users: User[] = []
    
    async findAll(): Promise<User[]> {
        return this.users
    }

    async find(id: string): Promise<User | undefined> {
        return this.users.find((user) => user.id === id)
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.users.find((user) => user.email.getValue() === email)
    }

    async save(user: User): Promise<void> {
        this.users.push(user)
    }

    async update(user: User): Promise<void> {
        const existsUser = await this.find(user.id)
        if (!existsUser) throw new Error('user not found')
        this.users.splice(this.users.indexOf(existsUser), 1, user)
    }

    async delete(id: string): Promise<void> {
        const userAlreadyExists = await this.find(id)
        if (!userAlreadyExists) throw new Error('user not found')
        const users = this.users.filter((user) => user.id !== id)
        this.users = users
    }

    async clean(): Promise<void> {
        this.users = []
    }
}
