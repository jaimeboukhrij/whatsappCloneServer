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

  interface WritingClients {
    [id: string]: {
        socket: Socket,
        user: User,
        chatRoomId:string
    }
  }
@Injectable()
export class MessagesWsService {
  connectedClients: ConnectedClients = {}
  private writingClients: WritingClients = {}

  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async registerClient (client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new Error('User not found')

    this.checkUserConnection(user)

    if (this.isUserConnected(user.id)) {
      console.log(`Usuario con ID ${user.id} ya está conectado. Desconectando la conexión anterior.`)
      this.removeClientByUserId(user.id)
    }

    this.connectedClients[client.id] = {
      socket: client,
      user
    }
  }

  async registerWritingClient (client: Socket, userId: string, chatRoomId:string) {
    const user = await this.userRepository.findOneBy({ id: userId })
    if (!user) throw new Error('User not found')

    // this.checkUserConnection(user)

    if (this.isUserWriting(user.id)) {
      return
    }

    this.writingClients[client.id] = {
      socket: client,
      user,
      chatRoomId
    }
  }

  removeClient (clientId: string) {
    delete this.connectedClients[clientId]
  }

  removeWritingClient (clientId: string) {
    delete this.writingClients[clientId]
  }

  removeClientByUserId (userId: string) {
    for (const [socketId, clientData] of Object.entries(this.connectedClients)) {
      if (clientData.user.id === userId) {
        this.removeClient(socketId)
        break
      }
    }
  }

  removeWritingClientByUserId (userId: string) {
    for (const [socketId, clientData] of Object.entries(this.writingClients)) {
      if (clientData.user.id === userId) {
        this.removeWritingClient(socketId)
        break
      }
    }
  }

  isUserConnected (userId: string): boolean {
    return Object.values(this.connectedClients).some(client => client.user.id === userId)
  }

  isUserWriting (userId: string) {
    return Object.values(this.writingClients).some(client => client.user.id === userId)
  }

  getConnectedUsersIds (): string[] {
    return Object.keys(this.connectedClients).map(socketId => this.getUserId(socketId))
  }

  getWritingUsersData (): { userID: string; chatRoomId: string }[] {
    return Object.keys(this.writingClients).map(socketId => {
      const userID = this.getUserId(socketId)
      const chatRoomId = this.writingClients[socketId].chatRoomId
      return { userID, chatRoomId }
    })
  }

  getUserFullName (socketId: string) {
    return this.connectedClients[socketId]?.user.firstName || ''
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
    return this.connectedClients[socketId]?.user.id || null
  }

  private checkUserConnection (user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId]

      if (connectedClient.user.id === user.id) {
        console.log(`Desconectando la conexión anterior para el usuario con ID ${user.id}`)
        connectedClient.socket.disconnect()
        break
      }
    }
  }
}
