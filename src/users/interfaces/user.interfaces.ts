import { ChatRoomI } from '@/src/chats-room/interfaces'
import { Messages } from '@/src/messages/entities/message.entity'
import { User } from '@/src/shared/entities'

export type UserId = `${string}-${string}-${string}-${string}-${string}`; // formato UUID

/* eslint-disable no-unused-vars */
export enum NotificationsSilencedEnum {
  QUERY = 'query',
  ALL = 'all',
  NO_READ = 'noRead',
  FAVORITE = 'favorite',
  GROUPS = 'groups',
  ARCHIVED = 'archived',
}

export interface GetUserChatsRoomI{
chatRoom:ChatRoomI;
contactUser:User;
user:User;
messagesDelivered:Messages[]
}
