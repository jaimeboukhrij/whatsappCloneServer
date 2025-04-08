import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { User } from 'src/shared/entities'
import { UpdateUserDto } from '../shared/dto'
import { ChatRoomI } from 'src/chats-room/interfaces'
import { UtilService } from 'src/shared/services/utils.service'

@Injectable()
export class UsersService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly utilsService:UtilService

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

  async findSome (ids:string[]) {
    try {
      const users = await this.userRepository.find({
        where: {
          id: In(ids)
        }
      })
      const planeUsers = users.map(user => {
        delete user.password
        return user
      })
      return planeUsers
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

    return ({ ...user, lastSeen: this.utilsService.formatLastSeen(new Date(user.lastSeen)) })
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

    const updatedUser = this.userRepository.merge(user, updateUserDto)
    return await this.userRepository.save(updatedUser)
  }

  async findUsersByUsernamePrefix (prefix: string, currentUserId:string) {
    try {
      const currentUsercontactsIds = (await this.findOnePlane(currentUserId)).contacts.map(contact => contact.id)
      let users = await this.userRepository
        .createQueryBuilder('user')
        .where('user.userName ILIKE :prefix', { prefix: `${prefix}%` })
        .leftJoinAndSelect('user.contacts', 'contact')
        .limit(10)
        .getMany()

      if (!users.length) return []

      users = users.filter(user => !currentUsercontactsIds.includes(user.id))
      users = users.filter(user => user.id !== currentUserId)

      const userWithoutPassword = users.map(user => {
        delete user.password
        return user
      })

      return userWithoutPassword
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async getUsersRecommended (currentUserId:string) {
    try {
      const currentUsercontactsIds = (await this.findOnePlane(currentUserId)).contacts.map(contact => contact.id)
      let usersRecommended = await this.findAll()

      usersRecommended = usersRecommended.filter(user => !currentUsercontactsIds.includes(user.id))
      usersRecommended = usersRecommended.filter(user => user.id !== currentUserId)

      const userWithoutPassword = usersRecommended.map(user => {
        delete user.password
        return user
      })

      return userWithoutPassword
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async getUserChatsRoom (userId: string):Promise<ChatRoomI[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { chatsRoom: { messages: { owner: true }, users: true } }
    })

    if (!user) throw new Error('User not found')
    const chatsRoom = await Promise.all(
      user.chatsRoom.map(async (chatRoom) => {
        const contactUser = chatRoom.users?.find((user) => user.id !== userId)
        return {
          ...chatRoom,
          name: `${contactUser.firstName} ${contactUser.lastName}`,
          urlImg: contactUser.urlImg,
          contactUserId: contactUser.id
        }
      })
    )

    return chatsRoom
  }

  remove (id: number) {
    return `This action removes a #${id} user`
  }

  createUserByRepository (user:User) {
    return this.userRepository.create(user)
  }

  private handleExceptions (error:any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }
    console.log(error)
    throw new InternalServerErrorException(' Check servers logs')
  }
}
