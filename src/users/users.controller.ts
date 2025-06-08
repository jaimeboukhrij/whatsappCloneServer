import { UserStarredMessagesService } from './services/user-starred-messages.service'
import { Controller, Get, Body, Patch, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UpdateUserDto } from 'src/shared/dto'
import { Auth, GetUser } from 'src/auth/decorators'
import { User } from 'src/shared/entities'
import { StarredMessageI } from 'src/messages/interfaces/starred-messages.interface'
import { UserSearchService } from './services'
import { UserId } from './interfaces/user.interfaces'

@Controller('users')
@Auth()
export class UsersController {
  constructor (
    private readonly usersService: UsersService,
    private readonly userSearchService:UserSearchService,
    private readonly userStarredMessagesService:UserStarredMessagesService

  ) {}

  @Get()
  findAll () {
    return this.usersService.findAll()
  }

  @Get('recommended')
  async getUsersRecommended (
    @GetUser('id') currentUserId:UserId
  ): Promise<User[]> {
    return this.userSearchService.getUsersRecommended(currentUserId)
  }

  @Get('starred-messages')
  async getUserStarredMessages (
    @GetUser('id') userId:UserId
  ):Promise<StarredMessageI[]> {
    return this.userStarredMessagesService.getUserStarredMessages(userId)
  }

  @Get('search-by-username')
  async findUsersByUsernamePrefix (
    @Query('prefix') prefix: string,
    @GetUser('id') currentUserId:UserId
  ): Promise<User[]> {
    return this.userSearchService.findUsersByUsernamePrefix(prefix, currentUserId)
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
