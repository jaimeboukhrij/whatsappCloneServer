import { ChatsRoom } from 'src/chats-room/entities/chats-room.entity'
import { User } from 'src/shared/entities'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'

@Entity('messages')
export class Messages {
    @PrimaryGeneratedColumn('uuid')
      id: string

    @Column('text')
      text: string

    @Column('bool', { default: false })
      isRead: boolean

    @CreateDateColumn({ type: 'timestamp' })
      date: Date

    @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
      owner: User

    @Column('text')
      chatRoomId: string

    @ManyToOne(() => ChatsRoom, (chatRoom) => chatRoom.messages, { onDelete: 'CASCADE' })
      chatRoom: ChatsRoom
}
