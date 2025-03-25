import { Module } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { ContactsController } from './contacts.controller'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UsersModule } from 'src/users/users.module'

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [
    AuthModule,
    SharedModule,
    UsersModule
  ],
  exports: [ContactsService]
})
export class ContactsModule {}
