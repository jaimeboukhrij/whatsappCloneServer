import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { SeedModule } from './seed/seed.module'
import { UsersModule } from './users/users.module'
import { SharedModule } from './shared/shared.module'

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
    SharedModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
