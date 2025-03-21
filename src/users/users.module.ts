import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
    AuthModule,
    SharedModule
  ]

})
export class UsersModule {}
