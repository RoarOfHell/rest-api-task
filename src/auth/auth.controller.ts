import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './jwt.guard';

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('/signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto.id, dto.password);
  }

  @Post('/signin')
  signin(@Body() dto: SigninDto) {
    return this.auth.signin(dto.id, dto.password);
  }

  @Post('/signin/new_token')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/info')
  info(@Req() req: any) {
    return { id: req.user.login };
  }

  @Get('/logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refresh_token);
  }
}
