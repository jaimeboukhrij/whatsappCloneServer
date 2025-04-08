import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Socket } from 'socket.io'
import { User } from 'src/shared/entities'
import { Repository } from 'typeorm'

interface ConnectedClients {
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {}

  constructor (
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
  ) {}

  async registerClient (client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new Error('User not found')

    this.checkUserConnection(user)

    this.connectedClients[client.id] = {
      socket: client,
      user
    }
  }

  removeClient (clientId: string) {
    delete this.connectedClients[clientId]
  }

  getConnectedUsersIds (): string[] {
    return Object.keys(this.connectedClients).map(socketId => this.getUserId(socketId))
  }

  getUserFullName (socketId: string) {
    return this.connectedClients[socketId].user.firstName
  }

  getSocketIdByUserId (userId: string): string | null {
    for (const [socketId, clientData] of Object.entries(this.connectedClients)) {
      if (clientData.user.id === userId) {
        return socketId
      }
    }
    return null
  }

  getUserId (socketId: string) {
    return this.connectedClients[socketId]?.user.id
  }

  private checkUserConnection (user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId]

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect()
        break
      }
    }
  }
}
