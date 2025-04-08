import { ChatsRoomService } from './../chats-room/chats-room.service'
/* eslint-disable no-undef */
import { Injectable } from '@nestjs/common'
import { CreateGroupDto } from './dto/create-group.dto'
import { UpdateGroupDto } from './dto/update-group.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Group } from './entities/group.entity'
import { In, Repository } from 'typeorm'
import { User } from 'src/shared/entities'
import { CloudinaryService } from 'src/shared/services/cloudinary.service'

@Injectable()
export class GroupsService {
  constructor (
    @InjectRepository(Group) private readonly groupRepository: Repository<Group>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly chatsRoomService:ChatsRoomService
  ) {}

  async create (createGroupDto: CreateGroupDto, userId:string, image: Express.Multer.File) {
    const urlImg = await this.cloudinaryService.uploadImage(image)
    const members = await this.userRepository.find({
      where: {
        id: In(JSON.parse(createGroupDto.members))
      }
    })

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

  update (id: number, updateGroupDto: UpdateGroupDto) {
    return updateGroupDto
  }

  remove (id: number) {
    return `This action removes a #${id} group`
  }
}
