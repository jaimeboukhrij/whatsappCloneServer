import { User } from '@/src/shared/entities'
import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserId } from '../interfaces/user.interfaces'
import { UsersService } from './users.service'

@Injectable()
export class UserSearchService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService
  ) {}

  async findUsersByUsernamePrefix (prefix: string, currentUserId: UserId): Promise<User[]> {
    try {
      const currentUserContactsIds = (await this.usersService.findOnePlane(currentUserId))
        .contacts.map(contact => contact.id)

      let users = await this.userRepository
        .createQueryBuilder('user')
        .where('user.userName ILIKE :prefix', { prefix: `${prefix}%` })
        .leftJoinAndSelect('user.contacts', 'contact')
        .limit(10)
        .getMany()

      if (!users.length) return []

      users = users.filter(user =>
        !currentUserContactsIds.includes(user.id) && user.id !== currentUserId
      )

      return users.map(user => {
        delete user.password
        return user
      })
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async getUsersRecommended (currentUserId: UserId): Promise<User[]> {
    try {
      const currentUserContactsIds = (await this.usersService.findOnePlane(currentUserId))
        .contacts.map(contact => contact.id)

      let usersRecommended = await this.usersService.findAll()

      usersRecommended = usersRecommended.filter(user =>
        !currentUserContactsIds.includes(user.id) && user.id !== currentUserId
      )

      return usersRecommended.map(user => {
        delete user.password
        return user
      })
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  private handleExceptions (error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error)
    throw new InternalServerErrorException('Check servers logs')
  }
}
