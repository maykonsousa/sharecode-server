import { Token } from '../../../domain/entities/Token'
import { TokenRepository } from '../../../domain/repositories/TokenRepository'
import { prismaClient } from '../../database/prisma/client'

export class TokenRepositoryPrisma implements TokenRepository {
    async save(token: Token): Promise<void> {
        const data = {
            id: token.id,
            token: token.token,
            user_id: token.userId,
            type: token.type,
            is_revoked: token.isRevoked,
            expires_at: token.expiresAt
        }
        await prismaClient.token.create({ data })
    }

    async find(id: string): Promise<Token> {
        const tokenData = await prismaClient.token.findFirst({
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
        const tokensData = await prismaClient.token.findMany()
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
        const data = {
            id: token.id,
            token: token.token,
            user_id: token.userId,
            type: token.type,
            is_revoked: token.isRevoked,
            expires_at: token.expiresAt
        }
        await prismaClient.token.update({
            where: {
                id: token.id
            },
            data
        })
    }

    async delete(id: string): Promise<void> {
        await prismaClient.token.delete({
            where: {
                id
            }
        })
    }
}
