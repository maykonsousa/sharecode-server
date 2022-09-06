import { CustomError } from '../../../application/exceptions/CustomError'
import { Token } from '../../../domain/entities/Token'
import { TokenRepository } from '../../../domain/repositories/TokenRepository'

export class TokenRepositoryMemory implements TokenRepository {
    tokens: Token[] = []
    
    async save(token: Token): Promise<void> {
        this.tokens.push(token)
    }

    async find(id: string): Promise<Token> {
        return this.tokens.find(token => token.id === id)
    }

    async findAll(): Promise<Token[]> {
        return this.tokens
    }

    async upload(token: Token): Promise<void> {
        const existsToken = await this.find(token.id)
        if (!existsToken) throw new CustomError(404, 'token not found')
        this.tokens.splice(this.tokens.indexOf(existsToken), 1, token)
    }

    async delete(id: string): Promise<void> {
        const existsToken = await this.find(id)
        if (!existsToken) throw new CustomError(404, 'token not found')
        this.tokens.splice(this.tokens.indexOf(existsToken), 1)
    }
}
