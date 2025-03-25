import { Injectable } from '@nestjs/common'
import * as cloudinary from 'cloudinary'

@Injectable()
export class CloudinaryService {
  private cloudinary

  constructor () {
    this.cloudinary = cloudinary.v2
    this.cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })
  }

  // // Método para subir una imagen a Cloudinary
  // async uploadImage (file: Express.Multer.File): Promise<any> {
  //   try {
  //     const result = await this.cloudinary.uploader.upload(file.path)
  //     return result
  //   } catch (error) {
  //     throw new Error(`Error uploading image: ${error.message}`)
  //   }
  // }

  // Método para eliminar una imagen de Cloudinary
  async deleteImage (publicId: string): Promise<any> {
    try {
      const result = await this.cloudinary.uploader.destroy(publicId)
      return result
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`)
    }
  }

  async getImageUrl (publicId: string): Promise<string> {
    try {
      const result = await this.cloudinary.url(publicId, {
        secure: true
      })
      return result
    } catch (error) {
      throw new Error('Error fetching image URL: ' + error.message)
    }
  }
}
