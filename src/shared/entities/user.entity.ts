/* eslint-disable no-use-before-define */
import { ChatsRoom } from 'src/chats-room/entities/chats-room.entity'
import { Messages } from 'src/messages/entities/message.entity'
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
    id: string

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
    lastSeen?: string

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

  @ManyToMany(() => ChatsRoom, (chatsRoom) => chatsRoom.users)
    chatsRoom: ChatsRoom[]

  @OneToMany(() => Messages, (messages) => messages.owner)
    messages: Messages[]
}
