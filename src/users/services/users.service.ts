import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { User } from 'src/shared/entities'
import { UpdateUserDto } from '../../shared/dto'
import { UtilService } from 'src/shared/services/utils.service'
import { UserId } from '../interfaces/user.interfaces'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utilsService: UtilService
  ) {}

  async findAll (usersIds?: UserId[]): Promise<User[]> {
    try {
      let users: User[] = []

      if (usersIds?.length) {
        users = await this.userRepository.find({
          where: { id: In(usersIds) },
          relations: { contacts: true }
        })
      } else {
        users = await this.userRepository.find({
          relations: { contacts: true }
        })
      }

      return users.map(user => {
        delete user.password
        return user
      })
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async findOne (term: UserId | string): Promise<User> {
    let user: User

    if (isUUID(term)) {
      user = await this.userRepository.findOne({
        where: { id: term as UserId },
        relations: { contacts: true, chatsRoom: true }
      })
    }

    if (!user) {
      user = await this.userRepository.findOne({
        where: { userName: term },
        relations: { contacts: true }
      })
    }

    if (!user) {
      throw new BadRequestException(`User with userName or id "${term}" not found`)
    }

    return {
      ...user,
      lastSeen: this.utilsService.formatLastSeen(new Date(user.lastSeen))
    }
  }

  async findOnePlane (term: string): Promise<User> {
    const user = await this.findOne(term)
    delete user.password
    user.contacts.forEach(contact => delete contact.password)
    return user
  }

  async update (id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOnePlane(id)
    if (!user) throw new NotFoundException(`User with id: ${id} not found`)

    const updatedUser = this.userRepository.merge(user, updateUserDto)
    return await this.userRepository.save(updatedUser)
  }

  createUserByRepository (user: User): User {
    return this.userRepository.create(user)
  }

  remove (userId: UserId) {
    return `This action removes a #${userId} user`
  }

  private handleExceptions (error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error)
    throw new InternalServerErrorException('Check servers logs')
  }
}
