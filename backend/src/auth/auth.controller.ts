import { Controller, Post, Body, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    try {
      const user = await this.authService.validateUserCredentials(
        loginDto.email,
        loginDto.password
      );
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }
}
