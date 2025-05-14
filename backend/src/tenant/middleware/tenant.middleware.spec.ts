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
    const mockTenantService = {
      findByDomain: jest.fn(),
    };

    const mockTenantContextService = {
      runAsync: jest
        .fn()
        .mockImplementation((tenantId, callback) => callback()),
    };

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
          useValue: mockTenantService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    middleware = module.get<TenantMiddleware>(TenantMiddleware);
    tenantService = module.get<TenantService>(TenantService);
    tenantContextService =
      module.get<TenantContextService>(TenantContextService);
  });

  it("should be defined", () => {
    expect(middleware).toBeDefined();
  });

  describe("use", () => {
    it("should attach tenant to request and run in tenant context when found", async () => {
      // Mock request, response, and next function
      const req: any = {
        hostname: "middleware-test.com",
        path: "/products", // Not an admin route
      };
      const res: any = {};
      const next = jest.fn();

      // Mock findByDomain to return our test tenant
      jest.spyOn(tenantService, "findByDomain").mockResolvedValue(testTenant);

      // Call the middleware
      await middleware.use(req, res, next);

      // Expect tenant to be attached to request
      expect(req.tenant).toBeDefined();
      expect(req.tenant).toEqual(testTenant);

      // Expect tenant context to be run with the tenant ID
      expect(tenantContextService.runAsync).toHaveBeenCalledWith(
        testTenant.id,
        expect.any(Function)
      );

      // Expect next to be called
      expect(next).toHaveBeenCalled();
    });

    it("should bypass tenant resolution for admin routes", async () => {
      // Mock request, response, and next function
      const req: any = {
        hostname: "nonexistent-domain.com",
        path: "/admin/dashboard", // Admin route
      };
      const res: any = {};
      const next = jest.fn();

      // Call the middleware
      await middleware.use(req, res, next);

      // Expect findByDomain not to be called
      expect(tenantService.findByDomain).not.toHaveBeenCalled();

      // Expect tenant not to be attached to request
      expect(req.tenant).toBeUndefined();

      // Expect next to be called (middleware should continue)
      expect(next).toHaveBeenCalled();
    });

    it("should handle tenant not found error", async () => {
      // Mock request, response, and next function
      const req: any = {
        hostname: "nonexistent-domain.com",
        path: "/products", // Not an admin route
      };
      const res: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock findByDomain to return null
      jest.spyOn(tenantService, "findByDomain").mockResolvedValue(null);

      // Call the middleware
      await middleware.use(req, res, next);

      // Expect tenant not to be attached to request
      expect(req.tenant).toBeUndefined();

      // Expect response with 404 status
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: `Tenant not found for domain: nonexistent-domain.com`,
      });

      // Next should not be called
      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to the next middleware", async () => {
      // Mock request, response, and next function
      const req: any = {
        hostname: "error-domain.com",
        path: "/products", // Not an admin route
      };
      const res: any = {};
      const next = jest.fn();

      const testError = new Error("Database connection error");

      // Mock findByDomain to throw an error
      jest.spyOn(tenantService, "findByDomain").mockRejectedValue(testError);

      // Call the middleware
      await middleware.use(req, res, next);

      // Expect next to be called with the error
      expect(next).toHaveBeenCalledWith(testError);
    });
  });
});
