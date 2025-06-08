import { ChatRoomI } from '@/src/chats-room/interfaces'
import { User } from '@/src/shared/entities'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserId } from '../../users/interfaces/user.interfaces'
import { ChatsRoomFormaterService } from './chats-room-formated.service'

@Injectable()
export class ChatRoomUserService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly chatsRoomFormaterService:ChatsRoomFormaterService
  ) {}

  async getUserChatsRoom (userId: UserId): Promise<ChatRoomI[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        chatsRoom: {
          messages: { owner: true, starredBy: true },
          users: { contacts: true }
        }
      }
    })
    const chatsRooms = user.chatsRoom
    if (!user) throw new Error('User not found')
    return this.chatsRoomFormaterService.getChatRoomFormatFromClient(chatsRooms, user)
  }
}
