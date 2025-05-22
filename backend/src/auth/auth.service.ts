import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validates user credentials and returns a JWT token
   */
  async validateUserCredentials(email: string, password: string): Promise<any> {
    // Find user by email - we'll need to handle the compound key
    const users = await this.prisma.user.findMany({
      where: { email },
    });

    if (!users || users.length === 0) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // If multiple users with the same email exist (across different tenants),
    // we'll need to check all of them
    for (const user of users) {
      const isPasswordValid = await this.comparePassword(
        password,
        user.password
      );
      if (isPasswordValid) {
        return user;
      }
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  /**
   * Generates a JWT token for a user
   */
  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  /**
   * Hashes a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password
   */
  async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Validates a JWT payload and returns the user
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
