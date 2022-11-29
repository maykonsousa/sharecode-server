import { User } from '../../domain/entities/User'

export interface UserRepository {
    save(User: User): Promise<void>
    find(id: string): Promise<User>
    findByEmail(email: string): Promise<User>
    findAll(): Promise<User[]>
    update(User: User): Promise<void>
    delete(id: string): Promise<void>
    clean(): Promise<void>
}
