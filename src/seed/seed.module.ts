import { Module } from '@nestjs/common'
import { SeedService } from './seed.service'
import { SeedController } from './seed.controller'
import { AuthModule } from 'src/auth/auth.module'
import { SharedModule } from 'src/shared/shared.module'
import { ContactsModule } from 'src/contacts/contacts.module'

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, SharedModule, ContactsModule]
})
export class SeedModule {}
