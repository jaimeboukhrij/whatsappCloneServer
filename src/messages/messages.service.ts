import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'
import { isUUID } from 'class-validator'
import { UsersService } from 'src/users/users.service'
import { ChatsRoomService } from 'src/chats-room/chats-room.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Messages } from './entities/message.entity'
import { Repository } from 'typeorm'

@Injectable()
export class MessagesService {
  constructor (
    private readonly usersService:UsersService,
    @Inject(forwardRef(() => ChatsRoomService))
    private readonly chatsRoomService: ChatsRoomService,
    @InjectRepository(Messages) private readonly messagesRepository:Repository<Messages>
  ) {

  }

  async create (createMessageDto: CreateMessageDto) {
    const { chatRoomId, ownerId, text } = createMessageDto

    if (!isUUID(ownerId)) throw new BadRequestException(`${ownerId} is not a valid id`)
    const user = await this.usersService.findOne(ownerId)
    const userCreate = this.usersService.createUserByRepository(user)
    delete userCreate.contacts
    delete userCreate.password

    if (!isUUID(ownerId)) throw new BadRequestException(`${chatRoomId} is not a valid id`)
    const chatRoom = await this.chatsRoomService.findOne(chatRoomId)
    const chatRoomCreate = this.chatsRoomService.createChatRoomByRepository(chatRoom)

    try {
      const message = await this.messagesRepository.save({
        text,
        date: new Date(),
        owner: userCreate,
        chatRoom: chatRoomCreate,
        chatRoomId,
        isRead: false,
        isDelivered: createMessageDto.isDelivered
      })

      return message
    } catch (error) {
      console.log(error)
    }
  }

  async updateMany (messages: UpdateMessageDto[]) {
    const updates = messages.map(async (message) => {
      const existing = await this.messagesRepository.findOne({ where: { id: message.id } })
      if (!existing) throw new BadRequestException(`Message with id ${message.id} not found`)

      const updated = this.messagesRepository.merge(existing, message)
      return this.messagesRepository.save(updated)
    })

    return Promise.all(updates)
  }

  async deleteMany (messagesIds: string[]): Promise<void> {
    const messages = await Promise.all(
      messagesIds.map(async (id) => {
        const message = await this.messagesRepository.findOne({ where: { id } })
        if (!message) {
          throw new BadRequestException(`Message with id ${id} not found`)
        }
        return message
      })
    )

    await this.messagesRepository.remove(messages)
  }

  update (id: number, updateMessageDto: UpdateMessageDto) {
    return updateMessageDto
  }

  remove (id: number) {
    return `This action removes a #${id} message`
  }
}
