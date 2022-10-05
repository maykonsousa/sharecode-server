import { PrismaClient } from '@prisma/client'

export class PrismaDBAdapter {
    connection: PrismaClient

    connect(): void {
        this.connection = new PrismaClient()
    }

    getConnection(): PrismaClient {
        return this.connection
    }
}
