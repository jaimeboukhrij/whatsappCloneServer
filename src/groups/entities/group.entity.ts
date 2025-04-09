import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { IsOptional, IsString, IsUrl } from 'class-validator'
import { User } from 'src/shared/entities'

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
    id: string

  @Column()
  @IsString()
    name: string

  @Column({ nullable: true })
  @IsString()
  @IsUrl()
    urlImg: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
    description: string | null

  @ManyToMany(() => User, (user) => user.groups, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'groups_admins',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    }
  })
    admins: User[]

  @ManyToMany(() => User, (user) => user.groups, { onDelete: 'CASCADE' })
    members: User[]
}
