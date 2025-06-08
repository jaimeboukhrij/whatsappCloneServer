import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateChatsRoomDto } from '../dto/create-chats-room.dto'
import { UpdateChatsRoomDto } from '../dto/update-chats-room.dto'
import { UsersService } from '@/src/users/services'
import { User } from '@/src/shared/entities'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ChatsRoom } from '../entities/chats-room.entity'

@Injectable()
export class ChatsRoomFactoryService {
  constructor (
    private readonly usersService:UsersService,
    @InjectRepository(ChatsRoom)
    private readonly chatRoomRepository:Repository<ChatsRoom>

  ) { }

  async createChatRoomPrivate (createChatsRoomPrivateDto: CreateChatsRoomDto, curentUserId: string) {
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

  async createChatRoomGroup (createChatsRoomGroupDto: CreateChatsRoomDto, curentUserId: string) {
    if (!createChatsRoomGroupDto.membersIds.length) {
      throw new BadRequestException('You must provide a user to create a private chat')
    }

    const currentUser = await this.usersService.findOne(curentUserId)
    const users = await this.usersService.findAll(createChatsRoomGroupDto.membersIds)

    const chatRoom = this.chatRoomRepository.create({
      users: [currentUser, ...users],
      type: 'group',
      createdAt: new Date(),
      name: createChatsRoomGroupDto.name || 'Nuevo Grupo',
      urlImg: createChatsRoomGroupDto?.urlImg || null
    })

    // const membersIds = chatRoom.users.map(user => user.id)
    // this.wsGateway.createNewGroupSocket(membersIds)
    return await this.chatRoomRepository.save(chatRoom)
  }

  createChatRoomByRepository (chatRoom:ChatsRoom) {
    return this.chatRoomRepository.create(chatRoom)
  }

  getChatRoomByContactUserId (curentUserId:string, contactId:string) {
    return this.existingChatRoom(curentUserId, contactId)
  }

  async updateChatRoomPrivate (updateChatsRoomDto: UpdateChatsRoomDto, chatRoomId: string) {
    const { usersId, ...toUpdate } = updateChatsRoomDto
    let usersDb:User[] = []
    if (usersId?.length === 0) {
      return false
    }

    if (usersId?.length) {
      usersDb = await this.usersService.findAll(usersId)
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
}
