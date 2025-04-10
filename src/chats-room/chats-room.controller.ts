import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common'
import { ChatsRoomService } from './chats-room.service'
import { Auth, GetUser } from 'src/auth/decorators'
import { UpdateChatsRoomDto } from './dto/update-chats-room.dto'
import { CreateChatsRoomPrivateDto } from './dto/create-chats-room-private.dto'

@Controller('chats-room')
@Auth()
export class ChatsRoomController {
  constructor (private readonly chatsRoomService: ChatsRoomService) {}

  @Post()
  create (@Body() createChatsRoomPrivateDto: CreateChatsRoomPrivateDto, @GetUser('id') curentUserId:string) {
    return this.chatsRoomService.create(createChatsRoomPrivateDto, curentUserId)
  }

  @Delete(':id')
  delete (@Param('id') chatRoomId:string) {
    return this.chatsRoomService.delete(chatRoomId)
  }

  @Get(':id')
  findOne (@Param('id') id: string, @GetUser('id') currentUserId:string) {
    return this.chatsRoomService.findOne(id, currentUserId)
  }

  @Patch(':id')
  update (@Body() updateChatsRoomDto:UpdateChatsRoomDto, @Param('id') chatRoomId: string, @GetUser('id') currentUserId:string) {
    return this.chatsRoomService.update(updateChatsRoomDto, chatRoomId, currentUserId)
  }
}
