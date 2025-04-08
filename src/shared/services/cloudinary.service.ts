import { Injectable } from '@nestjs/common'
import * as cloudinary from 'cloudinary'
import { Readable } from 'typeorm/platform/PlatformTools'

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

  async uploadImage (file: Express.Multer.File): Promise<string> {
    try {
      if (!file) return null
      return new Promise((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          { folder: 'WhatsApp' },
          (error, result) => {
            if (error) return reject(error)
            resolve(result.secure_url)
          }
        )

        const bufferStream = new Readable()
        bufferStream.push(file.buffer)
        bufferStream.push(null)
        bufferStream.pipe(uploadStream)
      })
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`)
    }
  }

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
