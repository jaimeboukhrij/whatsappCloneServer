import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { SeedModule } from './seed/seed.module'
import { UsersModule } from './users/users.module'
import { SharedModule } from './shared/shared.module'
import { ContactsModule } from './contacts/contacts.module'
import { ChatsRoomModule } from './chats-room/chats-room.module'
import { MessagesModule } from './messages/messages.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module'
import { WsModule } from './web-socket/web-socket.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true
    }),
    AuthModule,
    SeedModule,
    UsersModule,
    SharedModule,
    ContactsModule,
    ChatsRoomModule,
    MessagesModule,
    WsModule,
    CloudinaryModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
