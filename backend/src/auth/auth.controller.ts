import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; mot_de_passe: string }) {
    return this.service.login(body.email, body.mot_de_passe);
  }
}