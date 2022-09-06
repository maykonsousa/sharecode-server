import { Message } from '../../domain/entities/Message'

export interface Mail {
  send(message: Message): Promise<void>
}
