import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator'

export class CreateChatsRoomDto {
  @IsArray()
    membersIds: string[]

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
