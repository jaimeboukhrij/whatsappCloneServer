import { UsersService } from './../users/users.service'
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatsRoom } from './entities/chats-room.entity'
import { Repository } from 'typeorm'
import { UpdateChatsRoomDto } from './dto/update-chats-room.dto'
import { CreateChatsRoomDto } from './dto/create-chats-room.dto'
import { ChatRoomI } from './interfaces'
import { UtilService } from 'src/shared/services/utils.service'
import { User } from 'src/shared/entities'
import { MessagesWsGateway } from 'src/socket/messages-ws/messages-ws.gateway'

@Injectable()
export class ChatsRoomService {
  constructor (
    private readonly usersService:UsersService,
    @InjectRepository(ChatsRoom) private readonly chatRoomRepository:Repository<ChatsRoom>,
    private readonly utilsService:UtilService,
    @Inject(forwardRef(() => MessagesWsGateway))
    private readonly messagesWsGateway: MessagesWsGateway,
    @InjectRepository(User) private readonly userRepository:Repository<User>

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

    const membersIds = chatRoom.users.map(user => user.id)
    this.messagesWsGateway.createNewGroupSocket(membersIds)
    return await this.chatRoomRepository.save(chatRoom)
  }

  private async updateChatRoomPrivate (updateChatsRoomDto: UpdateChatsRoomDto, chatRoomId: string) {
    const { usersId, ...toUpdate } = updateChatsRoomDto
    let usersDb:User[] = []
    if (usersId?.length === 0) {
      await this.delete(chatRoomId)
      return
    }

    if (usersId?.length) {
      usersDb = await this.usersService.findSome(usersId)
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

  getChatRoomByContactUserId (curentUserId:string, contactId:string) {
    return this.existingChatRoom(curentUserId, contactId)
  }

  async findOne (chatRoomId: string, userId?:string):Promise<ChatRoomI> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { chatsRoom: { messages: { owner: true }, users: { contacts: true } } }
    })

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: { messages: { owner: true, starredBy: true }, users: { contacts: true } }

    })

    if (!user) throw new Error('User not found')
    const updateChatRoom = await Promise.all([chatRoom].map(async (chatRoom) => {
      const contactUser = chatRoom.users?.find((user) => user.id !== userId)

      const messagesSorted = chatRoom.messages
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((message) => {
          const date = new Date(message.date)
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          const messageHour = `${hours}:${minutes}`
          const messageDate = this.utilsService.formatLastSeen(new Date(message.date))
          return {
            ...message,
            messageHour,
            messageDate,
            type:
            userId === message?.owner?.id
              ? ('sent' as 'sent' | 'received')
              : ('received' as 'sent' | 'received')
          }
        })
      const messagesToShow = messagesSorted.filter(m => !m.hideFor?.includes(userId))

      const messagesDelivered = messagesToShow.filter(
        message => !(message.type === 'received' && !message.isDelivered)
      ).map(message => {
        if (!message.isDelivered) return ({ ...message, isRead: true })
        return message
      })

      const lastTwentyMessages = messagesDelivered.slice(-20)
      const lastMessage = messagesDelivered.at(-1)
      const chatRoomPinned = user.chatsRoomPinned.find(chatsRoomPinned => chatsRoomPinned.chatRoomId === chatRoom.id)
      const chatsRoomNotificationsSilenced = user.chatsRoomNotificationsSilenced.find(chatsRoomSilenced => chatsRoomSilenced.chatRoomId === chatRoom.id)

      if (chatRoom.type === 'private') {
        const isBlockedByContact = contactUser.chatsRoomBlocked.some(chatRoomBlocked => chatRoomBlocked.chatRoomId === chatRoom.id)
        const isBlockedByUser = user.chatsRoomBlocked.some(chatRoomBlocked => chatRoomBlocked.chatRoomId === chatRoom.id)

        console.log('privateee')

        return {
          ...chatRoom,
          messages: messagesDelivered,
          name: `${contactUser.firstName} ${contactUser.lastName}`,
          urlImg: contactUser.urlImg,
          contactUserId: contactUser.id,
          lastSeen: this.utilsService.formatLastSeen(new Date(contactUser.lastSeen)),
          isRead: (!(((lastTwentyMessages.some(message => !message.isRead)) ?? false) && lastMessage?.owner.id === contactUser.id) || !messagesDelivered.length),
          inFavorites: user.chatsRoomFavorites.some(chatsRoomFavorites => chatsRoomFavorites.chatRoomId === chatRoom.id),
          isArchived: user.chatsRoomArchived.some(chatsRoomArchived => chatsRoomArchived.chatRoomId === chatRoom.id),
          isPinned: chatRoomPinned ? chatRoomPinned.value : null,
          notificationsSilenced: chatsRoomNotificationsSilenced ? chatsRoomNotificationsSilenced.value : null,
          isBlocked: isBlockedByContact || isBlockedByUser

        }
      } else {
        return {
          ...chatRoom,
          messages: messagesDelivered,
          contactUserId: contactUser?.id,
          isRead: !(((lastTwentyMessages.some(message => !message.isRead)) ?? false)) || lastMessage?.owner.id === user.id,
          inFavorites: user.chatsRoomFavorites.some(chatsRoomFavorites => chatsRoomFavorites.chatRoomId === chatRoom.id),
          isArchived: user.chatsRoomArchived.some(chatsRoomArchived => chatsRoomArchived.chatRoomId === chatRoom.id),
          isPinned: chatRoomPinned ? chatRoomPinned.value : null,
          notificationsSilenced: chatsRoomNotificationsSilenced ? chatsRoomNotificationsSilenced.value : null

        }
      }
    }))

    return updateChatRoom[0]
  }

  createChatRoomByRepository (chatRoom:ChatsRoom) {
    return this.chatRoomRepository.create(chatRoom)
  }
}
