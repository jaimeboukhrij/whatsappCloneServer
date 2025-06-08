import { UserId } from '@/src/users/interfaces/user.interfaces'
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator'

export class CreateChatsRoomDto {
  @IsArray()
    membersIds: UserId[]

  @IsOptional()
  @IsString()
    name?: string

  @IsOptional()
  @IsString()
    urlImg?: string | null

  @IsString()
  @IsEnum(['private', 'group'])
    type: 'private' | 'group'
}
