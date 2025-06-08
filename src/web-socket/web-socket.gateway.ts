import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CreateMessageDto } from 'src/messages/dto/create-message.dto'
import { ConnectionService } from './services/connection.service'
import { GroupHandlerService, MessageHandlerService, TypingHandlerService } from './services'
import { forwardRef, Inject } from '@nestjs/common'

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server

  constructor (
    private readonly connectionService: ConnectionService,
    @Inject(forwardRef(() => MessageHandlerService))
    private readonly messageHandler: MessageHandlerService,
    private readonly typingHandler: TypingHandlerService,
    private readonly groupHandler: GroupHandlerService
  ) {}

  async handleConnection (client: Socket) {
    await this.connectionService.handleConnection(client, this.wss)
  }

  async handleDisconnect (client: Socket) {
    await this.connectionService.handleDisconnect(client, this.wss)
  }

  @SubscribeMessage('message-from-client')
  async onMessageFromClient (client: Socket, message: CreateMessageDto) {
    await this.messageHandler.handleMessage(client, message, this.wss)
  }

  @SubscribeMessage('message-is-read-client')
  async onMessageIsRead (client: Socket, contactId: string) {
    await this.messageHandler.handleMessageRead(client, contactId, this.wss)
  }

  @SubscribeMessage('writing-from-client')
  async onWritingFromClient (client: Socket, data: { isWriting: boolean; chatRoomId: string }) {
    await this.typingHandler.handleTyping(client, data, this.wss)
  }

  @SubscribeMessage('on-delete-message-client')
  async onDeleteMessageFromClient (client: Socket, chatRoomId: string) {
    await this.messageHandler.handleDeleteMessage(client, chatRoomId, this.wss)
  }

  @SubscribeMessage('on-create-group-client')
  createNewGroupSocket (client: Socket, groupMembersIds: string[]) {
    console.log('denterooo', groupMembersIds)
    this.groupHandler.notifyNewGroup(groupMembersIds, this.wss)
  }
}
