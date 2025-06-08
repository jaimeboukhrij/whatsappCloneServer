import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { UsersService } from '@/src/users/services/users.service'
import { JwtPayloadInterface } from 'src/auth/interfaces'
import { UserId } from '@/src/users/interfaces/user.interfaces'
import { WsService } from '../web-socket.service'
import { Injectable } from '@nestjs/common'
import { ChatRoomUserService } from '@/src/users/services'

@Injectable()
export class ConnectionService {
  constructor (
    private readonly wsService: WsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly chatRoomUserService:ChatRoomUserService

  ) {}

  async handleConnection (client: Socket, wss: Server) {
    await this.changeLastSeen(client, wss, true)
  }

  async handleDisconnect (client: Socket, wss: Server) {
    await this.changeLastSeen(client, wss, false)
  }

  private async changeLastSeen (client: Socket, wss: Server, connect: boolean) {
    if (connect) {
      const authenticated = await this.authenticateClient(client)
      if (!authenticated) return
    }

    const userId = this.wsService.getUserId(client.id)
    if (!userId) return

    if (!connect) {
      this.wsService.removeClient(client.id)
    }

    await this.updateUserLastSeen(userId)
    await this.notifyPresenceUpdate(client, wss, userId)
  }

  private async authenticateClient (client: Socket): Promise<boolean> {
    const token = client.handshake.headers.token as string
    let payload: JwtPayloadInterface

    try {
      payload = this.jwtService.verify(token)
      await this.wsService.registerClient(client, payload.id)
      return true
    } catch (error) {
      console.log('Error en la verificación del token:', error)
      client.disconnect()
      return false
    }
  }

  private async updateUserLastSeen (userId: string) {
    const lastSeen = new Date().toISOString()
    await this.usersService.update(userId, { lastSeen })
  }

  private async notifyPresenceUpdate (client: Socket, wss: Server, userId: UserId) {
    const chatsRoom = await this.chatRoomUserService.getUserChatsRoom(userId)
    if (!chatsRoom.length) return

    const connectedUsers = this.wsService.getConnectedUsersIds()

    for (const chatRoom of chatsRoom) {
      if (!chatRoom) continue
      const { users } = chatRoom
      const contactUser = users.find(user => user.id !== userId)
      const contactSocketId = this.wsService.getSocketIdByUserId(contactUser?.id)
      if (!contactSocketId) continue
      wss.to(contactSocketId).emit('users-online-updated', connectedUsers)
    }

    wss.to(client.id).emit('users-online-updated', connectedUsers)
  }
}
