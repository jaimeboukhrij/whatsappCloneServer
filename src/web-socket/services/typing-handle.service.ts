import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Server, Socket } from 'socket.io'
import { JwtPayloadInterface } from 'src/auth/interfaces'
import { WsService } from '../web-socket.service'

@Injectable()
export class TypingHandlerService {
  constructor (
    private readonly wsService: WsService,
    private readonly jwtService: JwtService
  ) {}

  async handleTyping (client: Socket, data: { isWriting: boolean; chatRoomId: string }, wss: Server) {
    if (data.isWriting) {
      const authenticated = await this.authenticateTypingClient(client, data.chatRoomId)
      if (!authenticated) return
    } else {
      this.wsService.removeWritingClient(client.id)
    }

    wss.emit('writing-from-server', this.wsService.getWritingUsersData())
  }

  private async authenticateTypingClient (client: Socket, chatRoomId: string): Promise<boolean> {
    const token = client.handshake.headers.token as string
    let payload: JwtPayloadInterface

    try {
      payload = this.jwtService.verify(token)
      await this.wsService.registerWritingClient(client, payload.id, chatRoomId)
      return true
    } catch (error) {
      client.emit('token-error', { message: error })
      client.disconnect()
      return false
    }
  }
}
