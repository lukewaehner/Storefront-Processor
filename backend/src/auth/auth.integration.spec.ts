import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";

describe("Auth Integration Tests", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Test user data - these users are created by the seed-test.ts script
  const testUser = {
    email: "integration-test@example.com",
    password: "Password123!",
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env.test",
        }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Apply global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("/auth/login (POST)", () => {
    it("should authenticate user and return JWT token", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(testUser.email);

      // Verify the JWT token
      const decodedToken = jwtService.verify(response.body.accessToken);
      expect(decodedToken).toHaveProperty("sub");
      expect(decodedToken).toHaveProperty("email");
      expect(decodedToken.email).toBe(testUser.email);
    });

    it("should return 401 with invalid credentials", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: testUser.email,
          password: "wrong-password",
        })
        .expect(401);
    });

    it("should validate input and return 400 for invalid data", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "not-an-email",
          password: "pwd",
        })
        .expect(400);
    });
  });
});
