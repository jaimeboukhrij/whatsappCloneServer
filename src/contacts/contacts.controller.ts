import { Body, Controller, Delete, Get, Post } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { Auth, GetUser } from 'src/auth/decorators'
import { CreateContactDto } from './dto/create-contact.dto'

@Controller('contacts')
@Auth()
export class ContactsController {
  constructor (private readonly contactsService: ContactsService) {}

  @Get()
  findAll (
    @GetUser('id') userId:string
  ) {
    return this.contactsService.findAll(userId)
  }

  @Post()
  addNewContact (
    @Body() createContactDto: CreateContactDto,
    @GetUser('id') userId:string
  ) {
    return this.contactsService.create(userId, createContactDto)
  }

  @Delete()
  removeContact (
    @Body() createContactDto: CreateContactDto,
    @GetUser('id') userId:string
  ) {
    return this.contactsService.removeContact(userId, createContactDto)
  }
}
