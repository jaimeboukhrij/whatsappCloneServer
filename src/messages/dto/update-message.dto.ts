import { PartialType } from '@nestjs/mapped-types'
import { CreateMessageDto } from './create-message.dto'
import { IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsUUID()
    id: string

  @IsOptional()
  @IsString()
    isRead?: boolean
}
