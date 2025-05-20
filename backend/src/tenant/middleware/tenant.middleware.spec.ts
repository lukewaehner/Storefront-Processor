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
import { Test, TestingModule } from "@nestjs/testing";
import { TenantMiddleware } from "./tenant.middleware";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantService } from "../services/tenant.service";
import { TenantContextService } from "../services/tenant-context.service";
import { ConfigModule } from "@nestjs/config";
import { getPrismaTestClient } from "../../../test/utils/db-test-utils";

describe("TenantMiddleware", () => {
  let middleware: TenantMiddleware;
  let tenantService: TenantService;
  let tenantContextService: TenantContextService;
  let testTenant: any;
  let mockNext: jest.Mock;
  let mockReq: any;
  let mockRes: any;

  beforeAll(async () => {
    // Set up test tenant with domain
    const testClient = getPrismaTestClient();

    // Clean up any existing test data
    await testClient.domain.deleteMany({
      where: { domain: "middleware-test.com" },
    });
    await testClient.tenant.deleteMany({
      where: { slug: "middleware-test" },
    });

    // Create test tenant with domain
    testTenant = await testClient.tenant.create({
      data: {
        name: "Middleware Test Tenant",
        slug: "middleware-test",
        status: "ACTIVE",
        domains: {
          create: {
            domain: "middleware-test.com",
            isPrimary: true,
            isCustom: false,
          },
        },
      },
      include: {
        domains: true,
      },
    });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
      ],
      providers: [
        TenantMiddleware,
        {
          provide: TenantService,
          useValue: {
            findByDomain: jest.fn(),
          },
        },
        {
          provide: TenantContextService,
          useValue: {
            runAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: getPrismaTestClient(),
        },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
    tenantService = module.get<TenantService>(TenantService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
    mockNext = jest.fn();
    mockReq = { hostname: "test.example.com" };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  describe("use", () => {
    it("should bypass tenant resolution for admin routes", async () => {
      mockReq.path = "/admin/dashboard";

      await middleware.use(mockReq, mockRes, mockNext);

      expect(tenantService.findByDomain).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it("should resolve tenant by domain and set it in context", async () => {
      // Create a full mock tenant object with all required properties
      const mockTenant = {
        id: "test-tenant",
        name: "Test Tenant",
        slug: "test-tenant",
        status: "ACTIVE",
        plan: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {},
      };

      mockReq.path = "/products"; // Non-admin route

      // @ts-ignore - Ignore the type error in the mock
      jest.spyOn(tenantService, "findByDomain").mockResolvedValue(mockTenant);

      // Create a proper mock for runAsync that actually calls the callback function
      // Fix the callback issue to make it callable
      (tenantContextService.runAsync as jest.Mock).mockImplementation(
        async (tenantId, callback) => {
          // @ts-ignore - Make callback callable
          if (typeof callback === "function") {
            return await callback();
          }
          return undefined;
        }
      );

      await middleware.use(mockReq, mockRes, mockNext);

      expect(tenantService.findByDomain).toHaveBeenCalledWith(
        "test.example.com"
      );
      expect(mockReq.tenant).toBe(mockTenant);
      expect(tenantContextService.runAsync).toHaveBeenCalledWith(
        mockTenant.id,
        expect.any(Function)
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it("should return 404 when tenant not found", async () => {
      mockReq.path = "/products";

      jest.spyOn(tenantService, "findByDomain").mockResolvedValue(null);

      await middleware.use(mockReq, mockRes, mockNext);

      expect(tenantService.findByDomain).toHaveBeenCalledWith(
        "test.example.com"
      );
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: `Tenant not found for domain: test.example.com`,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass errors to next middleware", async () => {
      mockReq.path = "/products";
      const testError = new Error("Test error");

      jest.spyOn(tenantService, "findByDomain").mockRejectedValue(testError);

      await middleware.use(mockReq, mockRes, mockNext);

      expect(tenantService.findByDomain).toHaveBeenCalledWith(
        "test.example.com"
      );
      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});
