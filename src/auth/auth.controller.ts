import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from 'src/shared/dto/create-user.dto'
import { LoginUserDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService) {}

  @Post('register')
  register (@Body() createUserDto:CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @Post('login')
  login (@Body() loginUserDto:LoginUserDto) {
    return this.authService.login(loginUserDto)
  }
}
