import { Token } from '../entities/Token'

export interface TokenRepository {
    save(token: Token): Promise<void>
    find(id: string): Promise<Token>
    findAll(): Promise<Token[]>
    upload(token: Token): Promise<void>
    delete(id: string): Promise<void>
}
