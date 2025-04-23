// messages-ws.module.ts
import { Module, forwardRef } from '@nestjs/common'
import { MessagesWsGateway } from './messages-ws.gateway'
import { MessagesWsService } from './messages-ws.service'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UsersModule } from 'src/users/users.module'
import { MessagesModule } from 'src/messages/messages.module'

@Module({
  providers: [MessagesWsGateway, MessagesWsService],
  exports: [MessagesWsGateway],
  imports: [AuthModule, SharedModule, UsersModule,
    forwardRef(() => MessagesModule)]
})
export class MessagesWsModule {}
