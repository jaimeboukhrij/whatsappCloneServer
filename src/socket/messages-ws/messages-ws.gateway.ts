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
    origin: '*',
    credentials: true
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

  @SubscribeMessage('message-from-client') // Este nombre debe coincidir con el evento enviado desde el cliente
  async onMessageFromClient (client: Socket, payload: CreateMessageDto) {
    console.log('Payload recibido:', payload)
    const message = await this.messagesService.create(payload)
    this.wss.emit('message-from-server', message)
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
      console.log('Usuario no encontrado para el cliente:', client.id)
      return
    }

    const lastSeen = new Date().toISOString()
    await this.usersService.update(userId, { lastSeen })

    const contacts = (await this.usersService.findOnePlane(userId)).contacts

    for (const contact of contacts) {
      const contactSocketId = this.messagesWsService.getSocketIdByUserId(contact.id)
      if (contactSocketId) {
        console.log('Emitiendo actualización de usuarios en línea a:', contactSocketId)
        if (!connect) {
          this.messagesWsService.removeClient(client.id)
        }
        this.wss.to(contactSocketId).emit('users-online-updated', this.messagesWsService.getConnectedUsersIds())
      }
    }
  }
}
