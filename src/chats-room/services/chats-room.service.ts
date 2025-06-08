import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ChatsRoom } from '../entities/chats-room.entity'
import { Repository } from 'typeorm'
import { UpdateChatsRoomDto } from '../dto/update-chats-room.dto'
import { CreateChatsRoomDto } from '../dto/create-chats-room.dto'
import { ChatRoomI } from '../interfaces'
import { User } from 'src/shared/entities'
import { UserId } from '../../users/interfaces/user.interfaces'
import { ChatsRoomFactoryService } from './chats-room-factory.service'
import { ChatsRoomFormaterService } from './chats-room-formated.service'

@Injectable()
export class ChatsRoomService {
  constructor (
    @Inject(forwardRef(() => ChatsRoomFactoryService))
    private readonly chatsRoomFactoryService: ChatsRoomFactoryService,
    @InjectRepository(ChatsRoom)
    private readonly chatRoomRepository: Repository<ChatsRoom>,
    private readonly chatsRoomFormaterService: ChatsRoomFormaterService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ) {}

  create (createChatsRoomDto: CreateChatsRoomDto, curentUserId?:string) {
    if (createChatsRoomDto.type === 'private') return this.chatsRoomFactoryService.createChatRoomPrivate(createChatsRoomDto, curentUserId)
    return this.chatsRoomFactoryService.createChatRoomGroup(createChatsRoomDto, curentUserId)
  }

  async update (updateChatsRoomDto: UpdateChatsRoomDto, chatRoomId: string, currentUserId:UserId) {
    await this.findOne(chatRoomId, currentUserId)
    const succesFullUpdate = this.chatsRoomFactoryService.updateChatRoomPrivate(updateChatsRoomDto, chatRoomId)
    if (!succesFullUpdate) {
      await this.delete(chatRoomId)
      return
    }
    return succesFullUpdate
  }

  async findOne (chatRoomId: string, userId?:UserId):Promise<ChatRoomI> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { chatsRoom: { messages: { owner: true }, users: { contacts: true } } }
    })

    const chatRoom = await this.chatRoomRepository.find({
      where: { id: chatRoomId },
      relations: { messages: { owner: true, starredBy: true }, users: { contacts: true } }

    })

    if (!user) throw new Error('User not found')
    return await this.chatsRoomFormaterService.getChatRoomFormatFromClient(chatRoom, user)[0]
  }

  async delete (chatRoomId:string) {
    const chatRoom = await this.findOne(chatRoomId)
    try {
      await this.chatRoomRepository.delete({ id: chatRoom.id })
      return { message: `ChatRoom with id ${chatRoomId} was deleted` }
    } catch (error) {
      console.log(error)
    }
  }
}
