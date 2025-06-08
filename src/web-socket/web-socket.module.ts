// messages-ws.module.ts
import { Module, forwardRef } from '@nestjs/common'
import { WsService } from './web-socket.service'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UsersModule } from 'src/users/users.module'
import { MessagesModule } from 'src/messages/messages.module'
import { ChatsRoomModule } from 'src/chats-room/chats-room.module'
import { WsGateway } from './web-socket.gateway'
import { ConnectionService, GroupHandlerService, MessageHandlerService, TypingHandlerService } from './services'

@Module({
  providers: [WsGateway, WsService, ConnectionService, GroupHandlerService, MessageHandlerService, TypingHandlerService],
  exports: [WsService, ConnectionService, GroupHandlerService, MessageHandlerService, TypingHandlerService],
  imports: [AuthModule, SharedModule,
    forwardRef(() => UsersModule),
    forwardRef(() => ChatsRoomModule),
    forwardRef(() => MessagesModule)]
})
export class WsModule {}
