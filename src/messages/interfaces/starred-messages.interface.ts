import { Messages } from '../entities/message.entity'

export interface StarredMessageI extends Partial<Messages>{
  type: 'received' | 'sent'
  messageHour:string
  messageDate:string
}
