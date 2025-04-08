import { Module } from '@nestjs/common'
import { GroupsService } from './groups.service'
import { GroupsController } from './groups.controller'
import { SharedModule } from 'src/shared/shared.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Group } from './entities/group.entity'
import { ChatsRoomModule } from 'src/chats-room/chats-room.module'

@Module({
  controllers: [GroupsController],
  providers: [GroupsService],
  imports: [
    TypeOrmModule.forFeature([Group]),
    SharedModule,
    ChatsRoomModule
  ]
})
export class GroupsModule {}
