import { Message } from '../../core/domain/Message'

export interface Mail {
  send(message: Message): Promise<void>
}
