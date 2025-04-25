import { Controller, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { UpdateMessageDto } from './dto/update-message.dto'

@Controller('messages')
export class MessagesController {
  constructor (private readonly messagesService: MessagesService

  ) {}

  @Post()
  create (@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto)
  }

  @Put('update-many')
  updateMany (@Body() messages: UpdateMessageDto[]) {
    return this.messagesService.updateMany(messages)
  }

  @Put('delete-many')
  deleteMany (@Body() messagesIds: string[]) {
    console.log('controladorr', messagesIds)
    return this.messagesService.deleteMany(messagesIds)
  }

  @Patch(':id')
  update (@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(+id, updateMessageDto)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.messagesService.remove(+id)
  }
}
