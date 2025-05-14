import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";
import { ConfigModule } from "@nestjs/config";
import { getPrismaTestClient } from "../../test/utils/db-test-utils";

describe("PrismaService", () => {
  let service: PrismaService;
  let testClient;
  let tenantA;
  let tenantB;

  beforeAll(async () => {
    // Set up test tenants
    testClient = getPrismaTestClient();

    // Clean up existing test tenants
    await testClient.product.deleteMany({
      where: {
        OR: [
          { name: { contains: "Tenant A Test Product" } },
          { name: { contains: "Tenant B Test Product" } },
        ],
      },
    });

    await testClient.tenant.deleteMany({
      where: {
        OR: [{ name: "Tenant A" }, { name: "Tenant B" }],
      },
    });

    // Create two test tenants
    tenantA = await testClient.tenant.create({
      data: {
        name: "Tenant A",
        slug: "tenant-a",
        status: "ACTIVE",
      },
    });

    tenantB = await testClient.tenant.create({
      data: {
        name: "Tenant B",
        slug: "tenant-b",
        status: "ACTIVE",
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
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createPrismaForTenant", () => {
    it("should throw error when tenantId is not provided", () => {
      expect(() => service.createPrismaForTenant(null)).toThrow(
        "Tenant ID is required"
      );
      expect(() => service.createPrismaForTenant(undefined)).toThrow(
        "Tenant ID is required"
      );
      expect(() => service.createPrismaForTenant("")).toThrow(
        "Tenant ID is required"
      );
    });

    it("should return a PrismaClient when valid tenantId is provided", () => {
      const tenantPrisma = service.createPrismaForTenant(tenantA.id);
      expect(tenantPrisma).toBeDefined();
    });

    it("should filter queries by tenant ID", async () => {
      // Create test products for each tenant
      const productA = await testClient.product.create({
        data: {
          name: "Tenant A Test Product",
          description: "This product belongs to Tenant A",
          price: 10.0,
          slug: "tenant-a-test-product",
          tenantId: tenantA.id,
        },
      });

      const productB = await testClient.product.create({
        data: {
          name: "Tenant B Test Product",
          description: "This product belongs to Tenant B",
          price: 20.0,
          slug: "tenant-b-test-product",
          tenantId: tenantB.id,
        },
      });

      // Get tenant-specific Prisma clients
      const tenantAPrisma = service.createPrismaForTenant(tenantA.id);
      const tenantBPrisma = service.createPrismaForTenant(tenantB.id);

      // Query products with tenant-specific clients
      const productsForTenantA = await tenantAPrisma.product.findMany();
      const productsForTenantB = await tenantBPrisma.product.findMany();

      // Tenant A should only see their products
      expect(productsForTenantA.length).toBeGreaterThanOrEqual(1);
      expect(productsForTenantA.some((p) => p.id === productA.id)).toBe(true);
      expect(productsForTenantA.some((p) => p.id === productB.id)).toBe(false);

      // Tenant B should only see their products
      expect(productsForTenantB.length).toBeGreaterThanOrEqual(1);
      expect(productsForTenantB.some((p) => p.id === productB.id)).toBe(true);
      expect(productsForTenantB.some((p) => p.id === productA.id)).toBe(false);
    });
  });
});
