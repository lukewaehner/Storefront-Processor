/**
 * Mock utilities for testing without a real database
 */
export const mockPrismaClient = () => {
  return {
    product: {
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ id: "mock-id", ...data.data })
        ),
    },
    tenant: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === "test-tenant-id") {
          return Promise.resolve({
            id: "test-tenant-id",
            name: "Test Tenant",
            slug: "test-tenant",
            status: "ACTIVE",
          });
        }
        return Promise.resolve(null);
      }),
      findFirst: jest.fn().mockImplementation(({ where }) => {
        if (where.domains?.some?.({ domain: "test-domain.com" })) {
          return Promise.resolve({
            id: "test-tenant-id",
            name: "Test Tenant",
            slug: "test-tenant",
            status: "ACTIVE",
          });
        }
        return Promise.resolve(null);
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ id: "mock-tenant-id", ...data.data })
        ),
    },
    domain: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest
        .fn()
        .mockImplementation((data) =>
          Promise.resolve({ id: "mock-domain-id", ...data.data })
        ),
    },
    $disconnect: jest.fn().mockResolvedValue(undefined),
  };
};

// Mock for getPrismaTestClient
let mockClient = null;

export const getMockPrismaClient = () => {
  if (!mockClient) {
    mockClient = mockPrismaClient();
  }
  return mockClient;
};

export const resetMockDatabase = () => {
  console.log("Mocking database reset...");
  // Nothing to actually do here since we're using mocks
  return;
};

export const disconnectMockPrismaClient = async () => {
  if (mockClient) {
    await mockClient.$disconnect();
    mockClient = null;
  }
};
