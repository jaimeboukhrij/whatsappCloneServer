import { Module } from '@nestjs/common'
import { MessagesWsService } from './messages-ws.service'
import { MessagesWsGateway } from './messages-ws.gateway'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UsersModule } from 'src/users/users.module'
import { MessagesModule } from 'src/messages/messages.module'

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  imports: [AuthModule, SharedModule, UsersModule, MessagesModule]
})
export class MessagesWsModule {}
