import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { NewMessageDto } from './dtos/new-message.dto'
import { MessagesWsService } from './messages-ws.service'
import { JwtPayloadInterface } from 'src/auth/interfaces'
import { UsersService } from 'src/users/users.service'

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
    private readonly usersService: UsersService
  ) {}

  async handleConnection (client: Socket) {
    const token = client.handshake.headers.token as string
    let payload: JwtPayloadInterface

    try {
      // Verificación del token
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      console.log('Error en la verificación del token:', error)
      client.disconnect()
      return
    }

    // Emitir la actualización de usuarios conectados
    this.wss.emit('users-online-updated', this.messagesWsService.getConnectedUsersIds())
  }

  async handleDisconnect (client: Socket) {
    this.changeLastSeen(client)
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('users-online-updated', this.messagesWsService.getConnectedUsersIds())
  }

  @SubscribeMessage('message-from-client') // Este nombre debe coincidir con el evento enviado desde el cliente
  onMessageFromClient (client: Socket, payload: NewMessageDto) {
    console.log('Mensaje recibido desde el cliente:', payload) // Verifica que el mensaje se reciba correctamente
    this.wss.emit('message-from-server', payload)
  }

  private async changeLastSeen (client: Socket) {
    const userId = this.messagesWsService.getUserId(client.id)
    const fullName = this.messagesWsService.getUserFullName(client.id)

    if (!userId) {
      console.log('Usuario no encontrado para el cliente:', client.id)
      return
    }

    const lastSeen = new Date().toString()
    await this.usersService.update(userId, { lastSeen })

    const contacts = (await this.usersService.findOnePlane(userId)).contacts

    for (const contact of contacts) {
      const contactSocketId = this.messagesWsService.getSocketIdByUserId(contact.id)
      if (contactSocketId) {
        this.wss.to(contactSocketId).emit('users-last-seen', {
          userId,
          lastSeen,
          fullName
        })
      }
    }
  }
}
