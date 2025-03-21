import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { User } from 'src/shared/entities'
import { UpdateUserDto } from '../shared/dto'
import { NewContactDto } from './dto/new-contact.dto'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ) {

  }

  async findAll () {
    try {
      const users = await this.userRepository.find({
        relations: {
          contacts: true
        }
      })

      const userWithOutPassword = users.map(user => {
        delete user.password
        return user
      })

      return userWithOutPassword
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findOne (term: string) {
    let user:User
    if (isUUID(term)) {
      user = await this.userRepository.findOne({
        where: { id: term },
        relations: { contacts: true }
      })
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { userName: term },
        relations: { contacts: true }
      })
    }

    if (!user) throw new BadRequestException(`User width userName or id "${term}" not found`)

    return user
  }

  async findOnePlane (term:string) {
    const user = await this.findOne(term)
    delete user.password
    user.contacts.forEach(contact => delete contact.password)
    return user
  }

  async update (id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOnePlane(id)
    if (!user) throw new NotFoundException(`User with id: ${id} not found`)

    this.userRepository.merge(user, updateUserDto)

    await this.userRepository.save(user)

    return user
  }

  remove (id: number) {
    return `This action removes a #${id} user`
  }

  async addNewContact (userId:string, newContactDto:NewContactDto) {
    if (userId === newContactDto.id) throw new BadRequestException(`userId "${userId}" and newContactUserId "${newContactDto.id} are the same"`)

    const { contacts } = await this.findOnePlane(userId)
    const newContactUser = await this.findOnePlane(newContactDto.id)

    if (contacts.some(contact => contact.id === newContactDto.id)) throw new BadRequestException('This user is just your contact')
    const updatedContacts = [...contacts, newContactUser]

    return await this.update(userId, { contacts: updatedContacts })
  }

  async removeContact (userId:string, newContactDto:NewContactDto) {
    if (userId === newContactDto.id) throw new BadRequestException(`userId "${userId}" and newContactUserId "${newContactDto.id} are the same"`)

    const { contacts, ...user } = await this.findOnePlane(userId)
    if (!contacts.some(contact => contact.id === newContactDto.id)) throw new BadRequestException(`User with id "${newContactDto.id}" is not your contact`)

    const updatedContacts = contacts.filter(contact => contact.id !== newContactDto.id)

    await this.userRepository.save({
      ...user,
      contacts: updatedContacts
    })

    return `Contact with id "${newContactDto.id}" was deleted`
  }

  private handleExceptions (error:any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error)
    throw new InternalServerErrorException(' Check servers logs')
  }
}
