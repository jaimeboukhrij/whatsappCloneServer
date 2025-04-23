import { forwardRef, Module } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SharedModule } from 'src/shared/shared.module'
import { Messages } from './entities/message.entity'
import { UsersModule } from 'src/users/users.module'
import { ChatsRoomModule } from 'src/chats-room/chats-room.module'

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    TypeOrmModule.forFeature([Messages]),
    SharedModule,
    UsersModule,
    forwardRef(() => ChatsRoomModule)

  ],
  exports: [MessagesService]
})
export class MessagesModule {}
