import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

// Mock bcrypt for tests
jest.mock("bcrypt", () => ({
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hash: jest
    .fn()
    .mockImplementation((plainText) => Promise.resolve(`hashed_${plainText}`)),
}));

describe("RBAC Integration Tests", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Test users for different roles
  const testUsers = {
    admin: {
      email: "admin-rbac@example.com",
      password: "Password123!",
      role: UserRole.ADMIN,
    },
    staff: {
      email: "staff-rbac@example.com",
      password: "Password123!",
      role: UserRole.STAFF,
    },
    customer: {
      email: "customer-rbac@example.com",
      password: "Password123!",
      role: UserRole.CUSTOMER,
    },
  };

  // Before running tests, set up the app
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();

    // Verify test users exist
    for (const [role, userData] of Object.entries(testUsers)) {
      const user = await prismaService.user.findFirst({
        where: { email: userData.email },
      });

      if (!user) {
        console.warn(
          `Test user ${userData.email} not found in database. Tests may fail.`
        );
      }
    }
  });

  // After tests, close the app
  afterAll(async () => {
    await app.close();
  });

  // Helper to create auth token for a user
  function createAuthToken(email: string, role: UserRole) {
    return jwtService.sign({
      sub: `test-${role.toLowerCase()}-id`,
      email,
      role,
      tenantId: "test-tenant-id",
    });
  }

  describe("Role-based Endpoint Access", () => {
    let adminToken: string;
    let staffToken: string;
    let customerToken: string;

    beforeEach(() => {
      adminToken = createAuthToken(testUsers.admin.email, testUsers.admin.role);
      staffToken = createAuthToken(testUsers.staff.email, testUsers.staff.role);
      customerToken = createAuthToken(
        testUsers.customer.email,
        testUsers.customer.role
      );
    });

    it("should allow public access to public endpoint", async () => {
      const response = await request(app.getHttpServer()).get("/users");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "This endpoint is public and available to everyone"
      );
    });

    it("should allow authenticated users to access profile endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/profile")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "This endpoint requires authentication"
      );
    });

    it("should allow admin access to admin endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This endpoint requires ADMIN role");
    });

    it("should deny staff access to admin endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/admin")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(response.status).toBe(403);
    });

    it("should deny customer access to admin endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/admin")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(response.status).toBe(403);
    });

    it("should allow staff access to staff endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/staff")
        .set("Authorization", `Bearer ${staffToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This endpoint requires STAFF role");
    });

    it("should allow admin access to staff endpoint (role hierarchy)", async () => {
      const response = await request(app.getHttpServer())
        .get("/users/staff")
        .set("Authorization", `Bearer ${adminToken}`);

      // With role hierarchy implemented, admin should access staff endpoints
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("This endpoint requires STAFF role");
    });
  });
});
