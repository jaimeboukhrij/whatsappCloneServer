import { ChatRoomUserService } from './services/chat-room-user.service'
import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common'
import { ChatsRoomService } from './services/chats-room.service'
import { Auth, GetUser } from 'src/auth/decorators'
import { UpdateChatsRoomDto } from './dto/update-chats-room.dto'
import { CreateChatsRoomDto } from './dto/create-chats-room.dto'
import { UserId } from '../users/interfaces/user.interfaces'
import { ChatsRoomFactoryService } from './services'
import { ChatRoomI } from './interfaces'

@Controller('chats-room')
@Auth()
export class ChatsRoomController {
  constructor (private readonly chatsRoomService: ChatsRoomService,
    private readonly chatsRoomFactoryService:ChatsRoomFactoryService,
    private readonly chatRoomUserService:ChatRoomUserService
  ) {}

  @Post()
  create (@Body() createChatsRoomPrivateDto: CreateChatsRoomDto, @GetUser('id') curentUserId:string) {
    return this.chatsRoomService.create(createChatsRoomPrivateDto, curentUserId)
  }

  @Delete(':id')
  delete (@Param('id') chatRoomId:string) {
    return this.chatsRoomService.delete(chatRoomId)
  }

  @Get('from-user')
  async getUserChatsRoom (
      @GetUser('id') userId:UserId
  ):Promise<ChatRoomI[]> {
    return this.chatRoomUserService.getUserChatsRoom(userId)
  }

  @Get(':id')
  findOne (@Param('id') id: string, @GetUser('id') currentUserId:UserId) {
    return this.chatsRoomService.findOne(id, currentUserId)
  }

  @Get('find-contact-chat-room/:contactId')
  getChatRoomByContactUserId (@Param('contactId') contactId: string, @GetUser('id') currentUserId:string) {
    return this.chatsRoomFactoryService.getChatRoomByContactUserId(currentUserId, contactId)
  }

  @Patch(':id')
  update (@Body() updateChatsRoomDto:UpdateChatsRoomDto, @Param('id') chatRoomId: string, @GetUser('id') currentUserId:UserId) {
    return this.chatsRoomService.update(updateChatsRoomDto, chatRoomId, currentUserId)
  }
}
