import amqp, { Connection } from 'amqplib'
import { Queue } from './Queue'

export class RabbitMQAdapter implements Queue {
    private connection: Connection

    async connect(): Promise<void> {
        this.connection = await amqp.connect({
            hostname: process.env.RABBITMQ_HOST,
            username: process.env.RABBITMQ_USER,
            password: process.env.RABBITMQ_PASS
        })
    }

    async close(): Promise<void> {
        this.connection.close()
    }

    async publish(eventName: string, data: any): Promise<void> {
        const channel = await this.connection.createChannel()
        channel.assertQueue(eventName, { durable: true })
        channel.sendToQueue(eventName, Buffer.from(JSON.stringify(data)), { persistent: true })
    }
}
