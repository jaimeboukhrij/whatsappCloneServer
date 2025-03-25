import { UsersService } from './../users/users.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateContactDto } from './dto/create-contact.dto'
import { Repository } from 'typeorm'
import { User } from 'src/shared/entities'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class ContactsService {
  constructor (
    private readonly usersService:UsersService,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>

  ) {}

  async create (userId:string, createContactDto: CreateContactDto) {
    if (userId === createContactDto.id) throw new BadRequestException(`userId "${userId}" and newContactUserId "${createContactDto.id} are the same"`)

    const { contacts } = await this.usersService.findOnePlane(userId)
    const newContactUser = await this.usersService.findOnePlane(createContactDto.id)

    if (contacts.some(contact => contact.id === createContactDto.id)) throw new BadRequestException('This user is just your contact')
    const updatedContacts = [...contacts, newContactUser]

    return await this.usersService.update(userId, { contacts: updatedContacts })
  }

  async findAll (userId:string) {
    const userDB = await this.usersService.findOnePlane(userId)

    return userDB.contacts
  }

  async removeContact (userId:string, createContactDto: CreateContactDto) {
    if (userId === createContactDto.id) throw new BadRequestException(`userId "${userId}" and newContactUserId "${createContactDto.id} are the same"`)

    const { contacts, ...user } = await this.usersService.findOnePlane(userId)
    if (!contacts.some(contact => contact.id === createContactDto.id)) throw new BadRequestException(`User with id "${createContactDto.id}" is not your contact`)

    const updatedContacts = contacts.filter(contact => contact.id !== createContactDto.id)

    await this.userRepository.save({
      ...user,
      contacts: updatedContacts
    })

    return `Contact with id "${createContactDto.id}" was deleted`
  }
}
