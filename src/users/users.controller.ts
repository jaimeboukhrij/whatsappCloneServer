import { Controller, Get, Body, Patch, Param, Delete, ParseUUIDPipe, Post } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from 'src/shared/dto'
import { Auth, GetUser } from 'src/auth/decorators'
import { NewContactDto } from './dto/new-contact.dto'

@Controller('users')
@Auth()
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get()
  findAll () {
    return this.usersService.findAll()
  }

  @Get(':term')
  findOne (@Param('term') term: string) {
    return this.usersService.findOnePlane(term)
  }

  @Patch(':id')
  update (@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto)
  }

  @Post('contact')
  addNewContact (
    @Body() newContactDto:NewContactDto,
    @GetUser('id') userId:string
  ) {
    return this.usersService.addNewContact(userId, newContactDto)
  }

  @Delete('contact')
  removeContact (
    @Body() newContactDto:NewContactDto,
    @GetUser('id') userId:string
  ) {
    return this.usersService.removeContact(userId, newContactDto)
  }
}
