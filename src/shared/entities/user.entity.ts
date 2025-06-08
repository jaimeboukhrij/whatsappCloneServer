/* eslint-disable no-use-before-define */
import { UserId } from '@/src/users/interfaces/user.interfaces'
import { ChatsRoom } from 'src/chats-room/entities/chats-room.entity'
import { NotificationsSilencedEnum } from 'src/chats-room/interfaces'
import { Messages } from 'src/messages/entities/message.entity'
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
    id: UserId

  @Column('text', { unique: true })
    email: string

  @Column('text')
    password: string

  @Column('text', { unique: true })
    userName: string

  @Column('text')
    lastName: string

  @Column('text')
    firstName: string

  @Column('text', { nullable: true })
    urlImg: string | null

  @Column('text', { nullable: true })
    status: string | null

  @Column('text', { nullable: true })
    lastSeen?: string

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    chatsRoomArchived?: { chatRoomId: string; value: boolean }[]

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    chatsRoomNotificationsSilenced?: { chatRoomId: string; value: NotificationsSilencedEnum }[]

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    chatsRoomPinned?: { chatRoomId: string; value: Date }[]

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    chatsRoomFavorites?: { chatRoomId: string; value: boolean }[]

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
    chatsRoomBlocked?: { chatRoomId: string; value: boolean }[]

  @ManyToMany(() => User, (user) => user.contacts, { nullable: true, onDelete: 'CASCADE' })
  @JoinTable({
    name: 'user_contacts',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'contact_id',
      referencedColumnName: 'id'
    }
  })
    contacts: User[] | null

    @ManyToMany(() => Messages, (message) => message.starredBy, { nullable: true, onDelete: 'CASCADE' })
    @JoinTable({
      name: 'user_starredMessages',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'message_id', referencedColumnName: 'id' }
    })
      starredMessages: Messages[] | null

  @ManyToMany(() => ChatsRoom, (chatsRoom) => chatsRoom.users)
    chatsRoom: ChatsRoom[]

  @OneToMany(() => Messages, (messages) => messages.owner)
    messages: Messages[]
}
