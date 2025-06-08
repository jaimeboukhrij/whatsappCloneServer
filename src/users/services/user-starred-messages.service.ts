import { StarredMessageI } from '@/src/messages/interfaces/starred-messages.interface'
import { User } from '@/src/shared/entities'
import { UtilService } from '@/src/shared/services/utils.service'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserId } from '../interfaces/user.interfaces'

@Injectable()
export class UserStarredMessagesService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly utilsService: UtilService
  ) {}

  async getUserStarredMessages (userId: UserId): Promise<StarredMessageI[]> {
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
        const starredMessagesType = userId === starredMessage?.owner?.id
          ? 'sent' as 'sent' | 'received'
          : 'received' as 'sent' | 'received'

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
}
