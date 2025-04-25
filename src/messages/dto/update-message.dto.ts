import { PartialType } from '@nestjs/mapped-types'
import { CreateMessageDto } from './create-message.dto'
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator'

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  @IsUUID()
    id: string

  @IsOptional()
  @IsBoolean()
    isRead?: boolean

  @IsOptional()
  @IsString()
    hideFor?: string[]
}
