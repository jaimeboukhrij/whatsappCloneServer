import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './entities'
import { UtilService } from './services/utils.service'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'

@Module({
  controllers: [],
  providers: [CloudinaryService, UtilService],
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  exports: [TypeOrmModule, CloudinaryService, UtilService]
})
export class SharedModule {}
