import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../auth/decorators/roles.decorator";

describe("UsersController", () => {
  let controller: UsersController;
  let rolesGuard: RolesGuard;
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        RolesGuard,
        {
          provide: JwtAuthGuard,
          useValue: {
            canActivate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("RBAC Tests", () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      // Mock JWT guard to always return true for these tests
      jest.spyOn(jwtAuthGuard, "canActivate").mockReturnValue(true);
    });

    it("should allow access to public endpoints without authentication", () => {
      // Mock the reflector to return true for IS_PUBLIC_KEY
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

      expect(controller.getPublicUsers()).toEqual({
        message: "This endpoint is public and available to everyone",
      });
    });

    it("should allow admin access to admin endpoints", () => {
      // Mock the reflector to return ADMIN for ROLES_KEY
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      // Mock the request to have an admin user
      const mockRequest = {
        user: { id: "1", email: "admin@example.com", role: UserRole.ADMIN },
      };
      jest
        .spyOn(mockContext.switchToHttp(), "getRequest")
        .mockReturnValue(mockRequest);

      expect(rolesGuard.canActivate(mockContext)).toBe(true);
    });

    it("should deny staff access to admin endpoints", () => {
      // Mock the reflector to return ADMIN for ROLES_KEY
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      // Mock the request to have a staff user
      const mockRequest = {
        user: { id: "2", email: "staff@example.com", role: UserRole.STAFF },
      };
      jest
        .spyOn(mockContext.switchToHttp(), "getRequest")
        .mockReturnValue(mockRequest);

      expect(rolesGuard.canActivate(mockContext)).toBe(false);
    });
  });
});
