import { User } from 'src/shared/entities'
import { PrimaryGeneratedColumn, ManyToMany, JoinTable, Column, Entity, OneToMany } from 'typeorm'
import { NotificationsSilencedEnum } from '../interfaces/chat-room.interface'
import { Messages } from 'src/messages/entities/message.entity'

@Entity('chats-room')
export class ChatsRoom {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ nullable: true })
    name?: string

  @Column({ default: false })
    isArchived: boolean

  @Column({ type: 'enum', enum: NotificationsSilencedEnum, nullable: true })
    notificationsSilenced: NotificationsSilencedEnum | null

  @Column({ type: 'timestamp', nullable: true })
    isPinned: Date | null

  @Column({ default: false })
    isRead: boolean

  @Column({ default: false })
    inFavorites: boolean

  @Column({ default: false })
    isBlocked: boolean

  @Column({ nullable: true })
    urlImg?: string | null

  @ManyToMany(() => User, (user) => user.chatsRoom)
  @JoinTable({
    name: 'chats_room_users',
    joinColumn: {
      name: 'chat_room_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    }
  })
    users: User[]

  @Column('varchar', { default: 'private' })
    type: 'private' | 'group'

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

  @OneToMany(() => Messages, (messages) => messages.chatRoom)
    messages: Messages[]
}
