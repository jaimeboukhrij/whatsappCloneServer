import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from '../../shared/dto/create-user.dto'
import { Type } from 'class-transformer'
import { ValidateNested, IsOptional, IsEnum, IsBoolean, IsString, IsDate } from 'class-validator'
import { NotificationsSilencedEnum } from 'src/chats-room/interfaces'

class BooleanItemDto {
  @IsString()
    chatRoomId: string

  @IsBoolean()
    value: boolean
}

class EnumItemDto {
  @IsString()
    chatRoomId: string

  @IsEnum(NotificationsSilencedEnum)
    value: NotificationsSilencedEnum
}

class DateItemDto {
  @IsString()
    chatRoomId: string

  @IsDate()
  @Type(() => Date)
    value: Date
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
    lastSeen?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BooleanItemDto)
    chatsRoomArchived?: BooleanItemDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EnumItemDto)
    chatsRoomNotificationsSilenced?: EnumItemDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DateItemDto)
    chatsRoomPinned?: DateItemDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BooleanItemDto)
    chatsRoomFavorites?: BooleanItemDto[]

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BooleanItemDto)
    chatsRoomBlocked?: BooleanItemDto[]
}
