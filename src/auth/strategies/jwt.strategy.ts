import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayloadInterface } from '../interfaces/jwt-payload.interface'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { User } from 'src/shared/entities'

@Injectable()
export class JtwStrategy extends PassportStrategy(Strategy) {
  constructor (
        @InjectRepository(User)
        private readonly userRepository:Repository<User>
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate (payload:JwtPayloadInterface): Promise<User> {
    const { id } = payload
    const user = await this.userRepository.findOneBy({ id })

    if (!user) throw new UnauthorizedException('token not valid')

    return user
  }
}
