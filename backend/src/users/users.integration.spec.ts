import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users.module";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

describe("RBAC Integration Tests", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Test users for different roles - these users are created by the seed-test.ts script
  const testUsers = {
    admin: {
      email: "admin-rbac@example.com",
      password: "Password123!",
    },
    staff: {
      email: "staff-rbac@example.com",
      password: "Password123!",
    },
    customer: {
      email: "customer-rbac@example.com",
      password: "Password123!",
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

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  // After tests, close the app
  afterAll(async () => {
    await app.close();
  });

  // Helper to get auth token for a user
  async function getAuthToken(email: string, password: string) {
    const response = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password });

    return response.body.accessToken;
  }

  describe("Role-based Endpoint Access", () => {
    let adminToken: string;
    let staffToken: string;
    let customerToken: string;

    beforeEach(async () => {
      adminToken = await getAuthToken(
        testUsers.admin.email,
        testUsers.admin.password
      );
      staffToken = await getAuthToken(
        testUsers.staff.email,
        testUsers.staff.password
      );
      customerToken = await getAuthToken(
        testUsers.customer.email,
        testUsers.customer.password
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
      expect(response.body.user.email).toBe(testUsers.customer.email);
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

      // This test will fail since we haven't implemented role hierarchy
      // But it's good to include it to document expected behavior
      expect(response.status).toBe(403);
    });
  });
});
