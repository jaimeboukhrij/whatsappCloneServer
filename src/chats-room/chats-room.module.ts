import { forwardRef, Module } from '@nestjs/common'
import { ChatsRoomService } from './chats-room.service'
import { ChatsRoomController } from './chats-room.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatsRoom } from './entities/chats-room.entity'
import { UsersModule } from 'src/users/users.module'
import { SharedModule } from 'src/shared/shared.module'
import { MessagesWsModule } from 'src/socket/messages-ws/messages-ws.module'

@Module({
  controllers: [ChatsRoomController],
  imports: [
    TypeOrmModule.forFeature([ChatsRoom]),
    UsersModule,
    SharedModule,
    forwardRef(() => MessagesWsModule)
  ],
  providers: [ChatsRoomService],
  exports: [ChatsRoomService]
})
export class ChatsRoomModule {}
