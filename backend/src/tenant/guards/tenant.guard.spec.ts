/// <reference types="jest" />
import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "@jest/globals";
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
    it("should return true for public routes", () => {
      // Mock the reflector to say route is public
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValueOnce(true);

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it("should return true for routes with bypass-tenant decorator", () => {
      // First call for IS_PUBLIC_KEY returns false
      // Second call for BYPASS_TENANT_KEY returns true
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn(),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should return true for admin routes", () => {
      // Both decorator checks return false
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const req = { path: "/admin/users" };
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          // @ts-ignore - Type mismatch in test mocks
          getRequest: jest.fn().mockReturnValue(req),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it("should throw UnauthorizedException if tenant not found", () => {
      // Both decorator checks return false
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const req = { path: "/products" }; // Not an admin route
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          // @ts-ignore - Type mismatch in test mocks
          getRequest: jest.fn().mockReturnValue(req),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });

    it("should throw UnauthorizedException if tenant status is not ACTIVE", () => {
      // Both decorator checks return false
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const req = {
        path: "/products",
        tenant: { status: "SUSPENDED" },
      };
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          // @ts-ignore - Type mismatch in test mocks
          getRequest: jest.fn().mockReturnValue(req),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException
      );
    });

    it("should return true if tenant exists and status is ACTIVE", () => {
      // Both decorator checks return false
      jest
        .spyOn(reflector, "getAllAndOverride")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false);

      const req = {
        path: "/products",
        tenant: { status: "ACTIVE" },
      };
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          // @ts-ignore - Type mismatch in test mocks
          getRequest: jest.fn().mockReturnValue(req),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
