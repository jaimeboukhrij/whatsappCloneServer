import { IsString, IsEnum, IsArray } from 'class-validator'

export class CreateChatsRoomPrivateDto {
  @IsArray()
    users: string[]

  @IsString()
  @IsEnum(['private', 'group'])
    type: 'private' | 'group'
}
