import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { JtwStrategy } from './strategies/jwt.strategy'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  controllers: [AuthController],
  providers: [AuthService, JtwStrategy],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: '2h'
          }
        }
      }
    }),
    SharedModule
  ],
  exports: [JtwStrategy, PassportModule, JwtModule, AuthService]
})
export class AuthModule {}
