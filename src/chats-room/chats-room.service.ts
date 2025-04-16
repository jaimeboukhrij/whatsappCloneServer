import { UsersService } from './../users/users.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatsRoom } from './entities/chats-room.entity'
import { Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { UpdateChatsRoomDto } from './dto/update-chats-room.dto'
import { CreateChatsRoomDto } from './dto/create-chats-room.dto'
import { ChatRoomI } from './interfaces'
import { UtilService } from 'src/shared/services/utils.service'
import { User } from 'src/shared/entities'

@Injectable()
export class ChatsRoomService {
  constructor (
    private readonly usersService:UsersService,
    @InjectRepository(ChatsRoom) private readonly chatRoomRepository:Repository<ChatsRoom>,
    private readonly utilsService:UtilService

  ) {}

  create (createChatsRoomDto: CreateChatsRoomDto, curentUserId?:string) {
    if (createChatsRoomDto.type === 'private') return this.createChatRoomPrivate(createChatsRoomDto, curentUserId)
    return this.createChatRoomGroup(createChatsRoomDto, curentUserId)
  }

  async delete (chatRoomId:string) {
    const chatRoom = await this.findOne(chatRoomId)
    try {
      await this.chatRoomRepository.delete({ id: chatRoom.id })
      return { message: `ChatRoom with id ${chatRoomId} was deleted` }
    } catch (error) {
      console.log(error)
    }
  }

  async update (updateChatsRoomDto: UpdateChatsRoomDto, chatRoomId: string, currentUserId:string) {
    await this.findOne(chatRoomId, currentUserId)
    return this.updateChatRoomPrivate(updateChatsRoomDto, chatRoomId)
  }

  private async createChatRoomPrivate (createChatsRoomPrivateDto: CreateChatsRoomDto, curentUserId: string) {
    if (!createChatsRoomPrivateDto.membersIds.length) {
      throw new BadRequestException('You must provide a user to create a private chat')
    }

    if (createChatsRoomPrivateDto.membersIds.length > 1) {
      throw new BadRequestException('Conversations cannot be with more than one person')
    }

    const currentUser = await this.usersService.findOne(curentUserId)
    const user = await this.usersService.findOne(createChatsRoomPrivateDto.membersIds[0])

    if (await this.existingChatRoom(curentUserId, user.id)) {
      throw new BadRequestException('This chat already exists')
    }

    const chatRoom = this.chatRoomRepository.create({
      users: [currentUser, user],
      type: 'private',
      createdAt: new Date()
    })

    return await this.chatRoomRepository.save(chatRoom)
  }

  private async createChatRoomGroup (createChatsRoomGroupDto: CreateChatsRoomDto, curentUserId: string) {
    if (!createChatsRoomGroupDto.membersIds.length) {
      throw new BadRequestException('You must provide a user to create a private chat')
    }

    const currentUser = await this.usersService.findOne(curentUserId)
    const users = await this.usersService.findSome(createChatsRoomGroupDto.membersIds)

    const chatRoom = this.chatRoomRepository.create({
      users: [currentUser, ...users],
      type: 'group',
      createdAt: new Date(),
      name: createChatsRoomGroupDto.name,
      urlImg: createChatsRoomGroupDto.urlImg
    })

    return await this.chatRoomRepository.save(chatRoom)
  }

  private async updateChatRoomPrivate (updateChatsRoomDto: UpdateChatsRoomDto, chatRoomId: string) {
    const { users, ...toUpdate } = updateChatsRoomDto
    let usersDb:User[] = []

    if (users?.length) {
      usersDb = await this.usersService.findSome(users)
    }

    const dataToUpdate = {
      ...toUpdate,
      ...(usersDb.length && { users: usersDb })
    }

    const chatRoom = await this.chatRoomRepository.preload({
      id: chatRoomId,
      ...dataToUpdate
    })

    return await this.chatRoomRepository.save(chatRoom)
  }

  // async createChatRoomGroup (createChatsRoomGroupDto: CreateChatsRoomGroupDto) {
  //   const chatRoom = this.chatRoomRepository.create({
  //     users: createChatsRoomGroupDto.users,
  //     name: createChatsRoomGroupDto.name,
  //     urlImg: createChatsRoomGroupDto.urlImg,
  //     type: 'group',
  //     createdAt: new Date()

  //   })

  //   return await this.chatRoomRepository.save(chatRoom)
  // }

  private async existingChatRoom (curentUserId:string, contactId:string) {
    return await this.chatRoomRepository
      .createQueryBuilder('chatRoom')
      .innerJoin('chatRoom.users', 'user1')
      .innerJoin('chatRoom.users', 'user2')
      .where('user1.id = :curentUserId', { curentUserId })
      .andWhere('user2.id = :userId', { userId: contactId })
      .andWhere('chatRoom.type = :type', { type: 'private' })
      .getOne()
  }

  getChatRoomByContactUserId (curentUserId:string, contactId:string) {
    return this.existingChatRoom(curentUserId, contactId)
  }

  async findOne (chatRoomId: string, currentUserId?:string):Promise<ChatRoomI> {
    if (!isUUID(chatRoomId)) throw new BadRequestException('I need a valid  id')
    const chatRoom = await this.chatRoomRepository
      .findOne({
        where: { id: chatRoomId },
        relations: { messages: { owner: true }, users: true }
      })
    if (!chatRoom) throw new BadRequestException(`ChatRoom with id ${chatRoomId} not found`)
    if (!currentUserId && chatRoom.type === 'group') return chatRoom

    const contactUserId = chatRoom.users.find(user => user.id !== currentUserId)

    const contactUser = await this.usersService.findOnePlane(contactUserId.id)
    return ({
      ...chatRoom,
      name: `${contactUser.firstName} ${contactUser.lastName}`,
      urlImg: contactUser.urlImg,
      contactUserId: contactUser.id,
      lastSeen: contactUser.lastSeen
    })
  }

  createChatRoomByRepository (chatRoom:ChatsRoom) {
    return this.chatRoomRepository.create(chatRoom)
  }
}
