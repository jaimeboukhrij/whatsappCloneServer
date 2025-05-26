import { Controller, Get, Body, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from 'src/shared/dto'
import { Auth, GetUser } from 'src/auth/decorators'
import { User } from 'src/shared/entities'
import { ChatRoomI } from 'src/chats-room/interfaces'
import { StarredMessageI } from 'src/messages/interfaces/starred-messages.interface'

@Controller('users')
@Auth()
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  findAll () {
    return this.usersService.findAll()
  }

  @Get('recommended')
  async getUsersRecommended (
    @GetUser('id') currentUserId:string
  ): Promise<User[]> {
    return this.usersService.getUsersRecommended(currentUserId)
  }

  @Get('chats-room')
  async getUserChatsRoom (
    @GetUser('id') userId:string
  ):Promise<ChatRoomI[]> {
    return this.usersService.getUserChatsRoom(userId)
  }

  @Get('starred-messages')
  async getUserStarredMessages (
    @GetUser('id') userId:string
  ):Promise<StarredMessageI[]> {
    return this.usersService.getUserStarredMessages(userId)
  }

  @Get('search-by-username')
  async findUsersByUsernamePrefix (
    @Query('prefix') prefix: string,
    @GetUser('id') currentUserId:string
  ): Promise<User[]> {
    return this.usersService.findUsersByUsernamePrefix(prefix, currentUserId)
  }

  @Get(':term')
  findOne (@Param('term') term: string) {
    return this.usersService.findOnePlane(term)
  }

  @Patch(':id')
  update (@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }
}
