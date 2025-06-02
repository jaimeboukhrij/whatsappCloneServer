import { ContactsService } from './../contacts/contacts.service'
import { Injectable } from '@nestjs/common'

import { UserSeed, UsersSeed } from './data'
import { AuthService } from 'src/auth/auth.service'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/shared/entities'
import { Repository } from 'typeorm'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'

@Injectable()
export class SeedService {
  constructor (
    private readonly authService:AuthService,
    private readonly cloudinaryService:CloudinaryService,
    private readonly contactsService:ContactsService,
    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ) {}

  async createSeed () {
    await this.removeUsers()
    await this.insertUsers()
    return 'seed executed'
  }

  private async removeUsers () {
    await this.userRepository.delete({})
  }

  private async insertUsers (): Promise<void> {
    const initialUsers = UsersSeed

    const usersWithImg:UserSeed[] = []

    for (const user of initialUsers) {
      const imageUrl = await this.cloudinaryService.getImageUrl(user.cloudinaryId)
      usersWithImg.push({
        ...user,
        urlImg: imageUrl
      })
    }

    const usersDb = await Promise.all(usersWithImg.map(user => this.authService.register(user)))
    const usersIdDb = usersDb.filter(user => user.userName !== 'adrian_martinez').map(user => user.id).slice(0, 4)

    const adrianUser = usersDb.find(user => user.userName === 'adrian_martinez')

    await Promise.all(usersIdDb.map(idDb => this.contactsService.create(adrianUser.id, { id: idDb })))
  }
}
