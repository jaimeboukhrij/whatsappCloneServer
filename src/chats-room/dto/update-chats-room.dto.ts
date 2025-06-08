import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsString, IsBoolean, IsEnum, IsDate } from 'class-validator'
import { NotificationsSilencedEnum } from '../interfaces'
import { Transform } from 'class-transformer'
import { CreateChatsRoomDto } from './create-chats-room.dto'
import { UserId } from '@/src/users/interfaces/user.interfaces'

export class UpdateChatsRoomDto extends PartialType(CreateChatsRoomDto) {
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
    @IsOptional()
      urlImg?: string | null

    @IsString({ each: true })
    @IsOptional()
      usersId?: UserId[]

    @IsString()
      type: 'private' | 'group'
}
