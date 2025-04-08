import { Module } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { ContactsController } from './contacts.controller'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { UsersModule } from 'src/users/users.module'
import { Contact } from './entities/contact.entity'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  controllers: [ContactsController],
  providers: [ContactsService],
  imports: [
    TypeOrmModule.forFeature([Contact]),
    AuthModule,
    SharedModule,
    UsersModule
  ],
  exports: [ContactsService]
})
export class ContactsModule {}
