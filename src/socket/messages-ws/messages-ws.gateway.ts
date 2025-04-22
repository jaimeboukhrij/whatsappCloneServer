import { MessagesService } from './../../messages/messages.service'
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessagesWsService } from './messages-ws.service'
import { JwtPayloadInterface } from 'src/auth/interfaces'
import { UsersService } from 'src/users/users.service'
import { CreateMessageDto } from 'src/messages/dto/create-message.dto'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server

  constructor (
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService
  ) {}

  async handleConnection (client: Socket) {
    await this.changeLastSeen(client, true)
  }

  async handleDisconnect (client: Socket) {
    await this.changeLastSeen(client, false)
  }

  @SubscribeMessage('message-from-client')
  async onMessageFromClient (client: Socket, message: CreateMessageDto) {
    const userId = this.messagesWsService.getUserId(client.id)
    const chatsRoom = await this.usersService.getUserChatsRoom(userId)
    // const user = await this.usersService.findOnePlane(userId)
    const chatRoom = chatsRoom.find(chatroom => chatroom.id === message.chatRoomId)

    const messageCreate = await this.messagesService.create({
      ...message,
      isDelivered: !chatRoom.isBlocked
    })

    for (const chatRoomMember of chatRoom.users) {
      const contactSocketId = this.messagesWsService.getSocketIdByUserId(chatRoomMember.id)

      if (contactSocketId && !chatRoom.isBlocked) {
        this.wss.to(contactSocketId).emit('message-from-server', messageCreate)
      } else if (chatRoomMember.id === userId) {
        this.wss.to(contactSocketId).emit('message-from-server', { ...messageCreate, isRead: true })
      }
    }
  }

  @SubscribeMessage('message-is-read-client')
  async onMessageIsRead (client: Socket, contactId:string) {
    const userClientId = this.messagesWsService.getSocketIdByUserId(contactId)
    this.wss.to(userClientId).emit('message-is-read-server')
  }

  @SubscribeMessage('writing-from-client')
  async onWritingFromClient (client: Socket, isWriting: boolean) {
    if (isWriting) {
      const token = client.handshake.headers.token as string
      let payload: JwtPayloadInterface

      try {
        payload = this.jwtService.verify(token)
        await this.messagesWsService.registerWritingClient(client, payload.id)
      } catch (error) {
        console.log('Error en la verificación del token:', error)
        client.disconnect()
        return
      }
    }

    if (!isWriting) {
      this.messagesWsService.removeWritingClient(client.id)
    }
    this.wss.emit('writing-from-server', this.messagesWsService.getWritingUsersIds())
  }

  private async changeLastSeen (client: Socket, connect: boolean) {
    if (connect) {
      const token = client.handshake.headers.token as string
      let payload: JwtPayloadInterface

      try {
        payload = this.jwtService.verify(token)
        await this.messagesWsService.registerClient(client, payload.id)
      } catch (error) {
        console.log('Error en la verificación del token:', error)
        client.disconnect()
        return
      }
    }

    const userId = this.messagesWsService.getUserId(client.id)

    if (!userId) {
      return
    }

    if (!connect) {
      this.messagesWsService.removeClient(client.id)
    }

    const lastSeen = new Date().toISOString()
    await this.usersService.update(userId, { lastSeen })

    const chatsRoom = await this.usersService.getUserChatsRoom(userId)

    for (const chatRoom of chatsRoom) {
      const { users } = chatRoom
      const contactUser = users.find(user => user.id !== userId)
      const contactSocketId = this.messagesWsService.getSocketIdByUserId(contactUser.id)
      if (!contactSocketId) continue
      this.wss.to(contactSocketId).emit('users-online-updated', this.messagesWsService.getConnectedUsersIds())
    }

    this.wss.to(client.id).emit('users-online-updated', this.messagesWsService.getConnectedUsersIds())
  }
}
