import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsString, IsBoolean, IsEnum, IsDate } from 'class-validator'
import { NotificationsSilencedEnum } from '../interfaces'
import { Transform } from 'class-transformer'
import { CreateChatsRoomPrivateDto } from './create-chats-room-private.dto'

export class UpdateChatsRoomDto extends PartialType(CreateChatsRoomPrivateDto) {
    @IsOptional()
    @IsString()
      name?: string

    @IsBoolean()
    @IsOptional()
      isArchived?: boolean

    @IsOptional()
    @IsEnum(NotificationsSilencedEnum)
      notificationsSilenced: NotificationsSilencedEnum | null

    @IsOptional()
    @IsDate()
    @Transform(({ value }) => (value ? new Date(value) : null))
      isPinned?: Date | null

    @IsBoolean()
    @IsOptional()
      isRead?: boolean

    @IsBoolean()
    @IsOptional()
      inFavorites?: boolean

    @IsBoolean()
    @IsOptional()
      isBlocked?: boolean

    @IsOptional()
    @IsString()
      urlImg?: string | null

    @IsString({ each: true })
    @IsOptional()
      users?: string[]

    @IsString()
      type: 'private' | 'group'
}
