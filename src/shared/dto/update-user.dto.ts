import { PartialType } from '@nestjs/mapped-types'
import { CreateUserDto } from '../../shared/dto/create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  lastSeen?:string
}
