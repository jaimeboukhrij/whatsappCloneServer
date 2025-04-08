import { Messages } from 'src/messages/entities/message.entity'
import { User } from 'src/shared/entities'

/* eslint-disable no-unused-vars */
export enum NotificationsSilencedEnum {
  HOUR = 'hour',
  WEEK = 'week',
  ALWAYS = 'always',
}

export interface ChatRoomI {
  id: string;
  name?: string;
  lastChatMessage?: string;
  lastChatMessageHour?: Date;
  messagesWithoutRead?: number;
   messages: Messages[],
  isUserMessage?: boolean;
  urlImg?: string;
  isArchived: boolean;
  notificationsSilenced: NotificationsSilencedEnum | null;
  isPinned: Date | undefined;
  isRead: boolean;
  inFavorites: boolean;
  isBlocked: boolean;
  type: 'private' | 'group';
  users: User[];
  contactUserId?:string
  createdAt: Date
  lastSeen?:string
}
