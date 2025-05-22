import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { PrismaService } from "../prisma/prisma.service";
import { UserRole } from "@prisma/client";
import { AuthService } from "./auth.service";
import * as bcrypt from "bcrypt";

// Mock bcrypt for tests
jest.mock("bcrypt", () => ({
  compare: jest.fn().mockImplementation(() => Promise.resolve(true)),
  hash: jest
    .fn()
    .mockImplementation((plainText) => Promise.resolve(`hashed_${plainText}`)),
}));

describe("Auth Integration Tests", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let authService: AuthService;

  // Test user data - these users are created by the seed-test.ts script
  const testUser = {
    email: "integration-test@example.com",
    password: "Password123!",
    role: UserRole.ADMIN,
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
    authService = moduleFixture.get<AuthService>(AuthService);

    // Apply global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );

    await app.init();

    // Ensure test user exists
    const existingUser = await prismaService.user.findFirst({
      where: { email: testUser.email },
    });

    if (!existingUser) {
      console.warn("Test user not found in database. Tests may fail.");

      // Create test user if it doesn't exist
      await prismaService.user.create({
        data: {
          email: testUser.email,
          password: await bcrypt.hash(testUser.password, 10),
          firstName: "Integration",
          lastName: "Test",
          role: testUser.role,
          tenantId: "test-tenant-id",
          isEmailVerified: true,
        },
      });

      console.log("Created test user for auth integration tests");
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Auth Service", () => {
    it("should validate user credentials and return user", async () => {
      // Override bcrypt.compare to return true for this test
      (bcrypt.compare as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve(true)
      );

      const user = await authService.validateUserCredentials(
        testUser.email,
        testUser.password
      );

      expect(user).toBeDefined();
      expect(user.email).toBe(testUser.email);
    });

    it("should generate a valid JWT token", async () => {
      const user = await prismaService.user.findFirst({
        where: { email: testUser.email },
      });

      const result = await authService.login(user);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe(testUser.email);

      // Verify the JWT token
      const decodedToken = jwtService.verify(result.accessToken);
      expect(decodedToken).toHaveProperty("sub");
      expect(decodedToken).toHaveProperty("email");
      expect(decodedToken.email).toBe(testUser.email);
    });

    it("should throw UnauthorizedException for invalid credentials", async () => {
      // Override bcrypt.compare to return false for this test
      (bcrypt.compare as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve(false)
      );

      await expect(
        authService.validateUserCredentials(
          "nonexistent@example.com",
          "wrong-password"
        )
      ).rejects.toThrow();
    });
  });
});
