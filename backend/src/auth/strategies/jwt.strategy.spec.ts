import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === "JWT_SECRET") {
                return "test-secret";
              }
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(strategy).toBeDefined();
  });

  describe("validate", () => {
    it("should return user details from payload", async () => {
      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        role: "ADMIN",
        tenantId: "tenant-id",
        firstName: "Test",
        lastName: "User",
      };

      const payload: JwtPayload = {
        sub: "user-id",
        email: "test@example.com",
        role: "ADMIN",
        tenantId: "tenant-id",
      };

      jest.spyOn(authService, "validateUser").mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: "user-id",
        email: "test@example.com",
        role: "ADMIN",
        tenantId: "tenant-id",
        firstName: "Test",
        lastName: "User",
      });
      expect(authService.validateUser).toHaveBeenCalledWith(payload);
    });

    it("should throw UnauthorizedException when user validation fails", async () => {
      const payload: JwtPayload = {
        sub: "user-id",
        email: "test@example.com",
        role: "ADMIN",
        tenantId: "tenant-id",
      };

      jest
        .spyOn(authService, "validateUser")
        .mockRejectedValue(new Error("User not found"));

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.validateUser).toHaveBeenCalledWith(payload);
    });
  });
});
