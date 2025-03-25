import { IsString } from 'class-validator'

export class CreateContactDto {
  @IsString()
    id:string
}
