import { Test, TestingModule } from "@nestjs/testing";
import { UnauthorizedException } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUserCredentials: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should return token and user data on successful login", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "password123",
      };

      const mockUser = {
        id: "user-id",
        email: "test@example.com",
        role: "ADMIN",
      };

      const mockLoginResponse = {
        accessToken: "jwt-token",
        user: {
          id: "user-id",
          email: "test@example.com",
          role: "ADMIN",
          tenantId: null,
          firstName: "Test",
          lastName: "User",
        },
      };

      jest
        .spyOn(authService, "validateUserCredentials")
        .mockResolvedValue(mockUser);
      jest.spyOn(authService, "login").mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toBe(mockLoginResponse);
      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it("should throw UnauthorizedException when credentials are invalid", async () => {
      const loginDto: LoginDto = {
        email: "test@example.com",
        password: "wrong-password",
      };

      jest
        .spyOn(authService, "validateUserCredentials")
        .mockRejectedValue(new UnauthorizedException("Invalid credentials"));

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.validateUserCredentials).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
    });
  });
});
