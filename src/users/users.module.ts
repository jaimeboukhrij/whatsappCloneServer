import { Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './users.controller'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UserSearchService, UserStarredMessagesService } from './services'

@Module({
  controllers: [UsersController],
  providers: [UsersService,
    UserSearchService,
    UserStarredMessagesService],
  imports: [
    AuthModule,
    SharedModule
  ],
  exports: [
    UsersService,
    UserSearchService,
    UserStarredMessagesService
  ]

})
export class UsersModule {}
