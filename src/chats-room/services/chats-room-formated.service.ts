import { Messages } from '@/src/messages/entities/message.entity'
import { User } from '@/src/shared/entities'
import { GetUserChatsRoomI } from '@/src/users/interfaces/user.interfaces'
import { ChatRoomI } from '../interfaces'
import { UtilService } from '@/src/shared/services/utils.service'
import { Injectable } from '@nestjs/common'

@Injectable()

export class ChatsRoomFormaterService {
  constructor (
    private readonly utilsService:UtilService
  ) { }

  async getChatRoomFormatFromClient (chatsRooms:ChatRoomI[], user:User) {
    const userId = user.id
    return await Promise.all(
      chatsRooms.map(async (chatRoom) => {
        const contactUser = chatRoom.users?.find((user) => user.id !== userId)
        const messagesDelivered = this.getMessagesDelivered(chatRoom, userId)

        if (chatRoom.type === 'private') {
          return this.getPrivatesChatsRoom({ chatRoom, contactUser, user, messagesDelivered })
        }
        return this.getGroupsChatsRoom({ chatRoom, contactUser, user, messagesDelivered })
      })
    )
  }

  private getMessagesDelivered (chatRoom: ChatRoomI, userId: string) {
    const messagesSorted = this.sortChatsRoomMessages(chatRoom.messages, userId)
    const messagesToShow = messagesSorted.filter(m => !m.hideFor?.includes(userId))

    return messagesToShow
      .filter(message => !(message.type === 'received' && !message.isDelivered))
      .map(message => {
        if (!message.isDelivered) return { ...message, isRead: true }
        return message
      })
  }

  private getPrivatesChatsRoom ({ chatRoom, contactUser, user, messagesDelivered }: GetUserChatsRoomI) {
    const isBlockedByContact = contactUser.chatsRoomBlocked
      .some(chatRoomBlocked => chatRoomBlocked.chatRoomId === chatRoom.id)
    const isBlockedByUser = user.chatsRoomBlocked
      .some(chatRoomBlocked => chatRoomBlocked.chatRoomId === chatRoom.id)
    const lastTwentyMessages = messagesDelivered.slice(-20)
    const lastMessage = messagesDelivered.at(-1)
    const chatRoomPinned = user.chatsRoomPinned
      .find(chatsRoomPinned => chatsRoomPinned.chatRoomId === chatRoom.id)
    const chatsRoomNotificationsSilenced = user.chatsRoomNotificationsSilenced
      .find(chatsRoomSilenced => chatsRoomSilenced.chatRoomId === chatRoom.id)

    return {
      ...chatRoom,
      messages: messagesDelivered,
      name: `${contactUser.firstName} ${contactUser.lastName}`,
      urlImg: contactUser.urlImg,
      contactUserId: contactUser.id,
      lastSeen: this.utilsService.formatLastSeen(new Date(contactUser.lastSeen)),
      isRead: !(((lastTwentyMessages.some(message => !message.isRead)) ?? false) &&
               lastMessage?.owner.id === contactUser.id) || !messagesDelivered.length,
      inFavorites: user.chatsRoomFavorites
        .some(chatsRoomFavorites => chatsRoomFavorites.chatRoomId === chatRoom.id),
      isArchived: user.chatsRoomArchived
        .some(chatsRoomArchived => chatsRoomArchived.chatRoomId === chatRoom.id),
      isPinned: chatRoomPinned ? chatRoomPinned.value : null,
      notificationsSilenced: chatsRoomNotificationsSilenced ? chatsRoomNotificationsSilenced.value : null,
      isBlocked: isBlockedByContact || isBlockedByUser,
      status: contactUser.status
    }
  }

  private getGroupsChatsRoom ({ chatRoom, contactUser, user, messagesDelivered }: GetUserChatsRoomI) {
    const lastTwentyMessages = messagesDelivered.slice(-20)
    const lastMessage = messagesDelivered.at(-1)
    const chatRoomPinned = user.chatsRoomPinned
      .find(chatsRoomPinned => chatsRoomPinned.chatRoomId === chatRoom.id)
    const chatsRoomNotificationsSilenced = user.chatsRoomNotificationsSilenced
      .find(chatsRoomSilenced => chatsRoomSilenced.chatRoomId === chatRoom.id)

    return {
      ...chatRoom,
      messages: messagesDelivered,
      contactUserId: contactUser?.id,
      isRead: !(((lastTwentyMessages.some(message => !message.isRead)) ?? false)) ||
              lastMessage?.owner.id === user.id,
      inFavorites: user.chatsRoomFavorites
        .some(chatsRoomFavorites => chatsRoomFavorites.chatRoomId === chatRoom.id),
      isArchived: user.chatsRoomArchived
        .some(chatsRoomArchived => chatsRoomArchived.chatRoomId === chatRoom.id),
      isPinned: chatRoomPinned ? chatRoomPinned.value : null,
      notificationsSilenced: chatsRoomNotificationsSilenced ? chatsRoomNotificationsSilenced.value : null
    }
  }

  private sortChatsRoomMessages (messages: Messages[], userId: string) {
    return messages
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
          type: userId === message?.owner?.id
            ? ('sent' as 'sent' | 'received')
            : ('received' as 'sent' | 'received')
        }
      })
  }
}
