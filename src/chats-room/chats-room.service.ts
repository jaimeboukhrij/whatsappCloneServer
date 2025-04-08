import { UsersService } from './../users/users.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateChatsRoomPrivateDto } from './dto/create-chats-room-private.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatsRoom } from './entities/chats-room.entity'
import { Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { UpdateChatsRoomDto } from './dto/update-chats-room.dto'
import { CreateChatsRoomGroupDto } from './dto/create-chats-room-group.dto'
import { ChatRoomI } from './interfaces'
import { UtilService } from 'src/shared/services/utils.service'

@Injectable()
export class ChatsRoomService {
  constructor (
    private readonly usersService:UsersService,
    @InjectRepository(ChatsRoom) private readonly chatRoomRepository:Repository<ChatsRoom>,
    private readonly utilsService:UtilService

  ) {}

  create (createChatsRoomPrivateDto: CreateChatsRoomPrivateDto, curentUserId?:string) {
    if (createChatsRoomPrivateDto.type === 'private') return this.createChatRoomPrivate(createChatsRoomPrivateDto, curentUserId)
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

    const { users, ...toUpdate } = updateChatsRoomDto
    let usersDb = []

    if (users?.length) {
      usersDb = await this.usersService.findSome(users)
    }

    const chatRoom = await this.chatRoomRepository.preload({
      id: chatRoomId,
      ...toUpdate,
      users: usersDb.length ? usersDb : undefined
    })

    return this.chatRoomRepository.save(chatRoom)
  }

  private async createChatRoomPrivate (createChatsRoomPrivateDto: CreateChatsRoomPrivateDto, curentUserId: string) {
    if (!createChatsRoomPrivateDto.users.length) {
      throw new BadRequestException('You must provide a user to create a private chat')
    }

    if (createChatsRoomPrivateDto.users.length > 1) {
      throw new BadRequestException('Conversations cannot be with more than one person')
    }

    const currentUser = await this.usersService.findOne(curentUserId)
    const user = await this.usersService.findOne(createChatsRoomPrivateDto.users[0])

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

  async createChatRoomGroup (createChatsRoomGroupDto: CreateChatsRoomGroupDto) {
    const chatRoom = this.chatRoomRepository.create({
      users: createChatsRoomGroupDto.users,
      name: createChatsRoomGroupDto.name,
      urlImg: createChatsRoomGroupDto.urlImg,
      type: 'group',
      createdAt: new Date()

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
