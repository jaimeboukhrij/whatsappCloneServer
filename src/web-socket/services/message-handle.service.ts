import { Injectable, forwardRef, Inject } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

import { ChatRoomUserService } from '@/src/users/services'
import { ChatsRoomService } from '@/src/chats-room/services/chats-room.service'
import { CreateMessageDto } from 'src/messages/dto/create-message.dto'
import { MessagesService } from '@/src/messages/messages.service'
import { WsService } from '../web-socket.service'

@Injectable()
export class MessageHandlerService {
  constructor (
    private readonly wsService: WsService,
    private readonly messagesService: MessagesService,
    private readonly chatRoomUserService: ChatRoomUserService,
    @Inject(forwardRef(() => ChatsRoomService))
    private readonly chatsRoomService: ChatsRoomService
  ) {}

  async handleMessage (client: Socket, message: CreateMessageDto, wss: Server) {
    const userId = this.wsService.getUserId(client.id)
    const chatsRoom = await this.chatRoomUserService.getUserChatsRoom(userId)
    const chatRoom = chatsRoom.find(chatroom => chatroom.id === message.chatRoomId)

    const messageCreate = await this.messagesService.create({
      ...message,
      isDelivered: !chatRoom.isBlocked
    })

    await this.broadcastMessage(chatRoom, messageCreate, userId, wss)
  }

  async handleMessageRead (client: Socket, contactId: string, wss: Server) {
    const userClientId = this.wsService.getSocketIdByUserId(contactId)
    wss.to(userClientId).emit('message-is-read-server')
  }

  async handleDeleteMessage (client: Socket, chatRoomId: string, wss: Server) {
    const currentChatRoom = await this.chatsRoomService.findOne(chatRoomId)

    currentChatRoom.users.forEach(user => {
      const userSocketId = this.wsService.getSocketIdByUserId(user.id)
      wss.to(userSocketId).emit('on-delete-message-server')
    })
  }

  private async broadcastMessage (chatRoom: any, messageCreate: any, userId: string, wss: Server) {
    for (const chatRoomMember of chatRoom.users) {
      const contactSocketId = this.wsService.getSocketIdByUserId(chatRoomMember.id)

      if (contactSocketId && !chatRoom.isBlocked) {
        wss.to(contactSocketId).emit('message-from-server', messageCreate)
      } else if (chatRoomMember.id === userId) {
        wss.to(contactSocketId).emit('message-from-server', { ...messageCreate, isRead: true })
      }
    }
  }
}
