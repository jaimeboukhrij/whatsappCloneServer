import { Injectable } from '@nestjs/common'
import { Server } from 'socket.io'
import { WsService } from '../web-socket.service'

@Injectable()
export class GroupHandlerService {
  constructor (
    private readonly wsService: WsService
  ) {}

  notifyNewGroup (groupMembersIds: string[], wss: Server) {
    for (const memberId of groupMembersIds) {
      const contactSocketMemberId = this.wsService.getSocketIdByUserId(memberId)
      wss.to(contactSocketMemberId).emit('new-group-from-server')
    }
  }
}
