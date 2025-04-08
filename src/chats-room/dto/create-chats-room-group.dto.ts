import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator'
import { User } from 'src/shared/entities'

export class CreateChatsRoomGroupDto {
  @IsArray()
    users: User[]

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
