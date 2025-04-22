import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
    text: string

  @IsNotEmpty()
  @IsUUID()
    ownerId: string

  @IsNotEmpty()
  @IsUUID()
    chatRoomId: string

  @IsNotEmpty()
  @IsBoolean()
    isDelivered: boolean = false
}
