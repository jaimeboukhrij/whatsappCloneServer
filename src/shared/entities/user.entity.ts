/* eslint-disable no-use-before-define */
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
    id:string

  @Column('text', {
    unique: true
  })
    email:string

  @Column('text')
    password:string

  @Column('text', { unique: true })
    userName:string

  @Column('text')
    lastName:string

  @Column('text')
    firstName:string

  @Column('text', { nullable: true })
    urlImg:string| null

    @ManyToMany(() => User, (user: User) => user.contacts, { nullable: true })
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
}
