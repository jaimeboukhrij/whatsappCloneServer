import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { isUUID } from 'class-validator'
import { User } from 'src/shared/entities'
import { UpdateUserDto } from '../shared/dto'
import { ChatRoomI } from 'src/chats-room/interfaces'
import { UtilService } from 'src/shared/services/utils.service'
import { StarredMessageI } from 'src/messages/interfaces/starred-messages.interface'

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
        relations: { contacts: true, chatsRoom: true }
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
      relations: { chatsRoom: { messages: { owner: true, starredBy: true }, users: { contacts: true } } }
    })

    if (!user) throw new Error('User not found')
    const chatsRoom = await Promise.all(user.chatsRoom.map(async (chatRoom) => {
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
          isBlocked: isBlockedByContact || isBlockedByUser,
          status: contactUser.status

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
    })
    )

    return chatsRoom
  }

  async getUserStarredMessages (userId: string): Promise<StarredMessageI[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        starredMessages: {
          chatRoom: { users: true },
          owner: true,
          starredBy: true
        }
      }
    })

    const starredMessages: StarredMessageI[] = [...user.starredMessages]
      .map(starredMessage => {
        const { chatRoom } = starredMessage
        const starredMessagesType = userId === starredMessage?.owner?.id ? 'sent' as 'sent' | 'received' : 'received' as 'sent' | 'received'

        const messageDateObj = new Date(starredMessage.date)
        const messageHour = `${messageDateObj.getHours().toString().padStart(2, '0')}:${messageDateObj.getMinutes().toString().padStart(2, '0')}`
        const messageDate = this.utilsService.formatLastSeen(messageDateObj)

        if (chatRoom.type === 'group') {
          return {
            ...starredMessage,
            type: starredMessagesType,
            messageHour,
            messageDate
          }
        }

        const contactUser = chatRoom.users?.find(user => user.id !== userId)
        chatRoom.name = `${contactUser.firstName} ${contactUser.lastName}`
        chatRoom.urlImg = contactUser.urlImg

        return {
          ...starredMessage,
          type: starredMessagesType,
          messageHour,
          messageDate
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return starredMessages
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
