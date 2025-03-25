import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LoginUserDto } from './dto'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { JwtPayloadInterface } from './interfaces'
import { CreateUserDto } from 'src/shared/dto'
import { User } from 'src/shared/entities'

@Injectable()
export class AuthService {
  constructor (
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async register (createUserDto:CreateUserDto) {
    try {
      const user = this.userRepository.create({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10)
      })

      const userDB = await this.userRepository.save(user)
      console.log(userDB)

      return userDB
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async login (loginUserDto:LoginUserDto) {
    const { email, password } = loginUserDto

    const userDB = await this.userRepository.findOneBy({ email })
    if (!userDB) throw new BadRequestException('email or password are incorrect')

    const validPassword = bcrypt.compareSync(password, userDB.password)
    if (!validPassword) throw new BadRequestException('email or password are incorrect')

    delete userDB.password

    return {
      ...userDB,
      token: this.getJwtToken({ id: userDB.id })
    }
  }

  private getJwtToken (payload:JwtPayloadInterface) {
    return this.jwtService.sign(payload)
  }

  private handleDBExceptions (error:any) {
    if (error.code === '23505') throw new BadRequestException(error.detail)

    console.log(error)
    throw new InternalServerErrorException('Internal Server Error. Check the log')
  }
}
