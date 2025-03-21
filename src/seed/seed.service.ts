import { Injectable } from '@nestjs/common'

import { UsersSeed } from './data'
import { AuthService } from 'src/auth/auth.service'

@Injectable()
export class SeedService {
  constructor (
    private readonly authService:AuthService
  ) {}

  async createSeed () {
    await this.insertUsers()
    return 'seed executed'
  }

  private async insertUsers ():Promise<void> {
    const initialUsers = UsersSeed
    await Promise.all(initialUsers.map(user => this.authService.register(user)))
  }
}
