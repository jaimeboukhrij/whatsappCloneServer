import { IsArray, IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { User } from 'src/shared/entities'

export class CreateUserDto {
  @IsEmail()
    email:string

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
      message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string

  @IsString()
  @MinLength(2)
    firstName:string

  @IsString()
  @MinLength(2)
    lastName:string

  @IsString()
  @MinLength(2)
    userName:string

  @IsString()
  @IsOptional()
    urlImage?:string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => User)
  @IsOptional()
    contacts?: User[]
}
