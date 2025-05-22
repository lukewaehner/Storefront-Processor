import { Test, TestingModule } from "@nestjs/testing";
import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { RolesGuard } from "./roles.guard";
import { ROLES_KEY } from "../decorators/roles.decorator";

describe("RolesGuard", () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;
    });

    it("should return true if no roles are required", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(null);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it("should return true if user has required role", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      const mockRequest = { user: { role: UserRole.ADMIN } };
      jest
        .spyOn(mockContext.switchToHttp(), "getRequest")
        .mockReturnValue(mockRequest);

      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it("should return false if user does not have required role", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      const mockRequest = { user: { role: UserRole.CUSTOMER } };
      jest
        .spyOn(mockContext.switchToHttp(), "getRequest")
        .mockReturnValue(mockRequest);

      expect(guard.canActivate(mockContext)).toBe(false);
    });

    it("should return false if no user is found in request", () => {
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValue([UserRole.ADMIN]);

      const mockRequest = { user: null };
      jest
        .spyOn(mockContext.switchToHttp(), "getRequest")
        .mockReturnValue(mockRequest);

      expect(guard.canActivate(mockContext)).toBe(false);
    });
  });
});
