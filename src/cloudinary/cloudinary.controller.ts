import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { CloudinaryService } from './cloudinary.service'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('cloudinary')
export class CloudinaryController {
  constructor (private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async create (
    @UploadedFile() image: Express.Multer.File
  ) {
    const url = await this.cloudinaryService.uploadImage(image)
    return { url }
  }
}
