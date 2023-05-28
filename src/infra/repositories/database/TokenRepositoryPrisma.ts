import { Token } from '../../../core/domain/Token'
import { TokenRepository } from '../../../core/domain/TokenRepository'
import { PrismaDBAdapter } from '../../database/PrismaDBAdapter'

export class TokenRepositoryPrisma implements TokenRepository {
    constructor(
        readonly prismaClient: PrismaDBAdapter
    ) { }
    
    async save(token: Token): Promise<void> {
        const connection = this.prismaClient.getConnection()
        const data = {
            id: token.id,
            token: token.token,
            user_id: token.userId,
            type: token.type,
            is_revoked: token.isRevoked,
            expires_at: token.expiresAt
        }
        await connection.token.create({ data })
    }

    async find(id: string): Promise<Token> {
        const connection = this.prismaClient.getConnection()
        const tokenData = await connection.token.findFirst({
            where: {
                id
            }
        })
        if (!tokenData) return
        return new Token(
            tokenData.id,
            tokenData.token,
            tokenData.user_id,
            tokenData.type,
            tokenData.is_revoked,
            tokenData.expires_at
        )
    }

    async findAll(): Promise<Token[]> {
        const connection = this.prismaClient.getConnection()
        const tokensData = await connection.token.findMany()
        const tokens: Token[] = []
        for (const tokenData of tokensData) {
            tokens.push(
                new Token(
                    tokenData.id,
                    tokenData.token,
                    tokenData.user_id,
                    tokenData.type,
                    tokenData.is_revoked,
                    tokenData.expires_at
                )
            )
        }
        return tokens
    }

    async upload(token: Token): Promise<void> {
        const connection = this.prismaClient.getConnection()
        const data = {
            id: token.id,
            token: token.token,
            user_id: token.userId,
            type: token.type,
            is_revoked: token.isRevoked,
            expires_at: token.expiresAt
        }
        await connection.token.update({
            where: {
                id: token.id
            },
            data
        })
    }

    async delete(id: string): Promise<void> {
        const connection = this.prismaClient.getConnection()
        await connection.token.delete({
            where: {
                id
            }
        })
    }
}
