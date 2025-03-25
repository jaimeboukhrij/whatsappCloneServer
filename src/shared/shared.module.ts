import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities'
import { CloudinaryService } from './services/cloudinary.service'

@Module({
  controllers: [],
  providers: [CloudinaryService],
  imports: [
    TypeOrmModule.forFeature([User])

  ],
  exports: [TypeOrmModule, CloudinaryService]
})
export class SharedModule {}
