import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.domain.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  // Create demo tenant
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Store',
      slug: 'demo-store',
      domains: {
        create: [
          {
            domain: 'localhost',
            isPrimary: true,
            isCustom: false,
          },
          {
            domain: 'demo-store.local',
            isPrimary: false,
            isCustom: false,
          },
        ],
      },
      settings: {
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          fontFamily: 'Inter, sans-serif',
        },
        features: {
          enableReviews: true,
          enableWishlist: true,
          enableComparisons: false,
        },
        contact: {
          email: 'info@demo-store.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main St, Anytown, USA',
        },
      },
    },
  });

  // Create admin user for demo tenant
  await prisma.user.create({
    data: {
      email: 'admin@demo-store.com',
      password: '$2a$10$ixh5/UJQZxM2F3fYlhLvOemvY3SJwweag0s2vIYVvXyNSG7TH2Txa', // password: admin123
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isEmailVerified: true,
      tenantId: demoTenant.id,
    },
  });

  // Create test tenant
  const testTenant = await prisma.tenant.create({
    data: {
      name: 'Test Store',
      slug: 'test-store',
      domains: {
        create: [
          {
            domain: 'test-store.local',
            isPrimary: true,
            isCustom: false,
          },
        ],
      },
      settings: {
        theme: {
          primaryColor: '#9333EA',
          secondaryColor: '#EC4899',
          accentColor: '#14B8A6',
          fontFamily: 'Roboto, sans-serif',
        },
        features: {
          enableReviews: true,
          enableWishlist: false,
          enableComparisons: true,
        },
        contact: {
          email: 'info@test-store.com',
          phone: '+1 (555) 987-6543',
          address: '456 Main St, Othertown, USA',
        },
      },
    },
  });

  // Create admin user for test tenant
  await prisma.user.create({
    data: {
      email: 'admin@test-store.com',
      password: '$2a$10$ixh5/UJQZxM2F3fYlhLvOemvY3SJwweag0s2vIYVvXyNSG7TH2Txa', // password: admin123
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
      isEmailVerified: true,
      tenantId: testTenant.id,
    },
  });

  // Create platform admin (super admin)
  await prisma.user.create({
    data: {
      email: 'superadmin@storefront-processor.com',
      password: '$2a$10$ixh5/UJQZxM2F3fYlhLvOemvY3SJwweag0s2vIYVvXyNSG7TH2Txa', // password: admin123
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 