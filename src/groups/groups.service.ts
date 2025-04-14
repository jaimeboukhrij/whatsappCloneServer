import { ChatsRoomService } from './../chats-room/chats-room.service'
/* eslint-disable no-undef */
import { Injectable } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Group } from './entities/group.entity'
import { Repository } from 'typeorm'
import { User } from 'src/shared/entities'
import { CloudinaryService } from 'src/shared/services/cloudinary.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class GroupsService {
  constructor (
    @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly chatsRoomService:ChatsRoomService,
    private readonly usersService:UsersService
  ) {}

  async create (createGroupDto: CreateGroupDto, userId:string, image: Express.Multer.File) {
    const urlImg = await this.cloudinaryService.uploadImage(image)
    const members = await this.usersService.findSome((createGroupDto.members))

    const adminUser = await this.userRepository.findOneBy({ id: userId })

    const newGroup = this.groupRepository.create({
      ...createGroupDto,
      name: createGroupDto.name || 'Nuevo Grupo',
      urlImg,
      admins: [adminUser],
      members: [adminUser, ...members]
    })

    const groupDb = await this.groupRepository.save(newGroup)
    await this.chatsRoomService.createChatRoomGroup({
      name: groupDb.name,
      urlImg: groupDb.urlImg,
      users: groupDb.members,
      type: 'group'
    })
    return groupDb
  }

  findAll () {
    return 'This action returns all groups'
  }

  findOne (id: number) {
    return `This action returns a #${id} group`
  }

  async update (groupId: string, updateGroupDto: UpdateGroupDto) {
    const { members, ...toUpdate } = updateGroupDto
    let usersDb:User[] = []

    if (members?.length) {
      usersDb = await this.usersService.findSome(members)
    }

    const chatRoom = await this.groupRepository.preload({
      id: groupId,
      ...toUpdate,
      ...(usersDb.length && { users: usersDb })
    })

    const chatRoomEntity = this.groupRepository.create(chatRoom)
    return await this.groupRepository.save(chatRoomEntity)
  }

  remove (id: number) {
    return `This action removes a #${id} group`
  }
}
