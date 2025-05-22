import { PrismaClient, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedTestDatabase() {
  try {
    console.log("Seeding test database...");

    // Clear existing test data
    await clearTestData();

    // Create test tenant
    const testTenant = await prisma.tenant.create({
      data: {
        name: "Test Tenant",
        slug: "test-tenant",
        status: "ACTIVE",
      },
    });

    console.log(`Created test tenant with ID: ${testTenant.id}`);

    // Create test users with different roles
    const password = await bcrypt.hash("Password123!", 10);

    // Admin user
    await prisma.user.create({
      data: {
        email: "admin-test@example.com",
        password,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    // Staff user
    await prisma.user.create({
      data: {
        email: "staff-test@example.com",
        password,
        firstName: "Staff",
        lastName: "User",
        role: UserRole.STAFF,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    // Customer user
    await prisma.user.create({
      data: {
        email: "customer-test@example.com",
        password,
        firstName: "Customer",
        lastName: "User",
        role: UserRole.CUSTOMER,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    // Integration test user (used by auth.integration.spec.ts)
    await prisma.user.create({
      data: {
        email: "integration-test@example.com",
        password,
        firstName: "Integration",
        lastName: "Test",
        role: UserRole.ADMIN,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    // RBAC test users (used by users.integration.spec.ts)
    await prisma.user.create({
      data: {
        email: "admin-rbac@example.com",
        password,
        firstName: "Admin",
        lastName: "RBAC",
        role: UserRole.ADMIN,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    await prisma.user.create({
      data: {
        email: "staff-rbac@example.com",
        password,
        firstName: "Staff",
        lastName: "RBAC",
        role: UserRole.STAFF,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    await prisma.user.create({
      data: {
        email: "customer-rbac@example.com",
        password,
        firstName: "Customer",
        lastName: "RBAC",
        role: UserRole.CUSTOMER,
        tenantId: testTenant.id,
        isEmailVerified: true,
      },
    });

    console.log("Test database seeded successfully");
  } catch (error) {
    console.error("Error seeding test database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function clearTestData() {
  // Delete test users
  const testEmails = [
    "admin-test@example.com",
    "staff-test@example.com",
    "customer-test@example.com",
    "integration-test@example.com",
    "admin-rbac@example.com",
    "staff-rbac@example.com",
    "customer-rbac@example.com",
  ];

  await prisma.user.deleteMany({
    where: {
      email: {
        in: testEmails,
      },
    },
  });

  // Delete test tenant
  await prisma.tenant.deleteMany({
    where: {
      slug: "test-tenant",
    },
  });

  console.log("Cleared existing test data");
}

seedTestDatabase();
