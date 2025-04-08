/* eslint-disable no-undef */
import { IsString } from 'class-validator'

export class CreateGroupDto {
  @IsString()
    name?:string = 'Nuevo Grupo'

  @IsString()
    members:string
}
