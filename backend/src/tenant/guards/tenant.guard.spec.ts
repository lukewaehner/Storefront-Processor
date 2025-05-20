import { jest, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { TenantGuard } from "./tenant.guard";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { IS_PUBLIC_KEY } from "../../auth/decorators/public.decorator";
import { BYPASS_TENANT_KEY } from "../decorators/bypass-tenant.decorator";

describe("TenantGuard", () => {
  let guard: TenantGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  describe("canActivate", () => {
    let mockContext: ExecutionContext;

    beforeEach(() => {
      // Create a mock execution context
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ path: "/products" }), // Default non-admin path
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;
    });

    it("should allow access if route is admin path", () => {
      // Setup request with admin path
      const req = { path: "/admin/dashboard" };
      mockContext.switchToHttp().getRequest = jest.fn().mockReturnValue(req);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should allow access if route is marked as public", () => {
      // Setup reflector to return true for IS_PUBLIC_KEY
      jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
        if (key === IS_PUBLIC_KEY) return true;
        return false;
      });

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should allow access if route bypasses tenant check", () => {
      // Setup reflector to return true for BYPASS_TENANT_KEY
      jest.spyOn(reflector, "getAllAndOverride").mockImplementation((key) => {
        if (key === BYPASS_TENANT_KEY) return true;
        return false;
      });

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should allow access if tenant is in request", () => {
      // Setup reflector to return false for both keys
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      // Setup request with tenant
      const req = {
        path: "/products",
        tenant: { id: "tenant-id", status: "ACTIVE" },
      };
      mockContext.switchToHttp().getRequest = jest.fn().mockReturnValue(req);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should deny access if tenant is not in request", () => {
      // Setup reflector to return false for both keys
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      // Setup request without tenant
      const req = { path: "/products" };
      mockContext.switchToHttp().getRequest = jest.fn().mockReturnValue(req);

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });

    it("should deny access if tenant is not active", () => {
      // Setup reflector to return false for both keys
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

      // Setup request with inactive tenant
      const req = {
        path: "/products",
        tenant: { id: "tenant-id", status: "INACTIVE" },
      };
      mockContext.switchToHttp().getRequest = jest.fn().mockReturnValue(req);

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });
  });
});
