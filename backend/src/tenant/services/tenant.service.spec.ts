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
import { TenantService } from "./tenant.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigModule } from "@nestjs/config";
import { getPrismaTestClient } from "../../../test/utils/db-test-utils";
import { TenantStatus } from "../dto/create-tenant.dto";
import { NotFoundException } from "@nestjs/common";

describe("TenantService", () => {
  let service: TenantService;
  let mockPrismaService: any;
  let testClient;
  let testTenant;

  beforeAll(async () => {
    // Create test data
    testClient = getPrismaTestClient();

    // Clean up existing test tenant if it exists
    await testClient.domain.deleteMany({
      where: { domain: "tenant-service-test.com" },
    });
    await testClient.tenant.deleteMany({
      where: { slug: "tenant-service-test" },
    });

    // Create test tenant with domain
    testTenant = await testClient.tenant.create({
      data: {
        name: "Tenant Service Test",
        slug: "tenant-service-test",
        status: "ACTIVE",
        domains: {
          create: {
            domain: "tenant-service-test.com",
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
    mockPrismaService = {
      tenant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      domain: {
        findFirst: jest.fn(),
        createMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(function (callback) {
        // @ts-ignore - Ignore type checking for this mock function
        return callback(this);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
      ],
      providers: [
        TenantService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all tenants", async () => {
      const mockTenants = [
        { id: "tenant1", name: "Tenant 1" },
        { id: "tenant2", name: "Tenant 2" },
      ];

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.findMany.mockResolvedValue(mockTenants);

      const result = await service.findAll();

      expect(result).toEqual(mockTenants);
      expect(mockPrismaService.tenant.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a tenant when found", async () => {
      const mockTenant = { id: testTenant.id, name: testTenant.name };

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.findUnique.mockResolvedValue(mockTenant);

      const tenant = await service.findById(testTenant.id);
      expect(tenant).toEqual(mockTenant);
      expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: testTenant.id },
        include: { domains: true },
      });
    });

    it("should throw NotFoundException when tenant not found", async () => {
      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.findUnique.mockResolvedValue(null);

      await expect(service.findById("non-existent-id")).rejects.toThrow(
        NotFoundException
      );

      expect(mockPrismaService.tenant.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
        include: { domains: true },
      });
    });
  });

  describe("findByDomain", () => {
    it("should return a tenant when domain is found", async () => {
      const domain = "tenant-service-test.com";
      const mockDomainWithTenant = {
        domain,
        tenant: testTenant,
      };

      // @ts-ignore: Type error in mock
      mockPrismaService.domain.findFirst.mockResolvedValue(
        mockDomainWithTenant
      );

      const tenant = await service.findByDomain(domain);
      expect(tenant).toEqual(testTenant);
      expect(mockPrismaService.domain.findFirst).toHaveBeenCalledWith({
        where: { domain },
        include: { tenant: true },
      });
    });

    it("should return null when domain is not found", async () => {
      const domain = "non-existent-domain.com";

      // @ts-ignore: Type error in mock
      mockPrismaService.domain.findFirst.mockResolvedValue(null);

      const tenant = await service.findByDomain(domain);
      expect(tenant).toBeNull();
      expect(mockPrismaService.domain.findFirst).toHaveBeenCalledWith({
        where: { domain },
        include: { tenant: true },
      });
    });
  });

  describe("create", () => {
    it("should create a new tenant with domains", async () => {
      // Create a unique slug/domain for this test
      const uniqueSlug = `tenant-service-create-${Date.now()}`;
      const uniqueDomain = `${uniqueSlug}.com`;

      const createTenantDto = {
        name: "Create Tenant Test",
        slug: uniqueSlug,
        status: TenantStatus.ACTIVE,
        domains: [
          {
            domain: uniqueDomain,
            isPrimary: true,
            isCustom: false,
          },
        ],
      };

      const mockCreatedTenant = {
        id: "new-tenant-id",
        ...createTenantDto,
      };

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.create.mockResolvedValue(mockCreatedTenant);

      const createdTenant = await service.create(createTenantDto);

      expect(createdTenant).toEqual(mockCreatedTenant);
      expect(mockPrismaService.tenant.create).toHaveBeenCalledWith({
        data: {
          name: createTenantDto.name,
          slug: createTenantDto.slug,
          status: createTenantDto.status,
          domains: {
            create: createTenantDto.domains,
          },
        },
        include: {
          domains: true,
        },
      });
    });
  });

  describe("update", () => {
    it("should update an existing tenant", async () => {
      const updateData = {
        name: "Updated Tenant Name",
      };

      const mockUpdatedTenant = {
        id: testTenant.id,
        name: updateData.name,
        slug: testTenant.slug,
      };

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.findUnique.mockResolvedValue(testTenant);

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.update.mockResolvedValue(mockUpdatedTenant);

      const updatedTenant = await service.update(testTenant.id, updateData);

      expect(updatedTenant).toEqual(mockUpdatedTenant);
      expect(mockPrismaService.tenant.update).toHaveBeenCalledWith({
        where: { id: testTenant.id },
        data: updateData,
        include: {
          domains: true,
        },
      });
    });
  });

  describe("delete", () => {
    it("should delete a tenant", async () => {
      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.findUnique.mockResolvedValue(testTenant);

      // @ts-ignore: Type error in mock
      mockPrismaService.tenant.delete.mockResolvedValue(testTenant);

      await service.delete(testTenant.id);

      expect(mockPrismaService.tenant.delete).toHaveBeenCalledWith({
        where: { id: testTenant.id },
        include: { domains: true },
      });
    });
  });
});
