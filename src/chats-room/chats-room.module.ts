import { Module } from '@nestjs/common'
import { ChatsRoomService } from './services/chats-room.service'
import { ChatsRoomController } from './chats-room.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatsRoom } from './entities/chats-room.entity'
import { UsersModule } from 'src/users/users.module'
import { SharedModule } from 'src/shared/shared.module'
import { ChatsRoomFactoryService, ChatsRoomFormaterService } from './services'
import { ChatRoomUserService } from './services/chat-room-user.service'

@Module({
  controllers: [ChatsRoomController],
  imports: [
    TypeOrmModule.forFeature([ChatsRoom]),
    UsersModule,
    SharedModule
  ],
  providers: [ChatsRoomService, ChatsRoomFactoryService, ChatsRoomFormaterService, ChatsRoomFormaterService, ChatRoomUserService],
  exports: [ChatsRoomService, ChatsRoomFactoryService, ChatsRoomFormaterService, ChatsRoomFormaterService, ChatRoomUserService]
})
export class ChatsRoomModule {}
