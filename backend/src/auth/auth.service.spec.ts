import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";

// Mock bcrypt
jest.mock("bcrypt", () => ({
  compare: jest.fn().mockResolvedValue(true),
}));

import * as bcrypt from "bcrypt";

// Mock the PrismaService
const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// Mock the JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue("test-jwt-token"),
};

describe("AuthService", () => {
  let service: AuthService;
  let mockPrismaService;
  let mockJwtService;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findMany: jest.fn(),
      },
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue("test-jwt-token"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUserCredentials", () => {
    it("should return a user when credentials are valid", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        password: "hashed-password",
        role: "ADMIN",
        tenantId: "tenant-id",
      };

      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.validateUserCredentials(
        "test@example.com",
        "password"
      );

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await expect(
        service.validateUserCredentials("nonexistent@example.com", "password")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("login", () => {
    it("should return access token and user data", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        password: "hashed-password",
        role: "ADMIN",
        tenantId: "tenant-id",
        firstName: "Test",
        lastName: "User",
      };

      const result = await service.login(mockUser);

      expect(result).toEqual({
        accessToken: "test-jwt-token",
        user: {
          id: "user-id",
          email: "test@example.com",
          role: "ADMIN",
          tenantId: "tenant-id",
          firstName: "Test",
          lastName: "User",
        },
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: "user-id",
        email: "test@example.com",
        role: "ADMIN",
        tenantId: "tenant-id",
      });
    });
  });
});
