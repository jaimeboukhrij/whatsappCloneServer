import { IsString } from 'class-validator'

export class NewContactDto {
  @IsString()
    id: string
}
