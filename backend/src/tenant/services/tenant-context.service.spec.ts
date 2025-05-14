import { Test, TestingModule } from "@nestjs/testing";
import { TenantContextService } from "./tenant-context.service";

describe("TenantContextService", () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  afterEach(() => {
    // Reset the AsyncLocalStorage after each test
    service.clear();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCurrentTenantId", () => {
    it("should return null when no tenant id is set", () => {
      const tenantId = service.getCurrentTenantId();
      expect(tenantId).toBeNull();
    });

    it("should return the tenant id when set", () => {
      const testTenantId = "test-tenant-id";

      service.run(testTenantId, () => {
        const tenantId = service.getCurrentTenantId();
        expect(tenantId).toBe(testTenantId);
      });
    });

    it("should handle nested contexts correctly", () => {
      const outerTenantId = "outer-tenant-id";
      const innerTenantId = "inner-tenant-id";

      service.run(outerTenantId, () => {
        expect(service.getCurrentTenantId()).toBe(outerTenantId);

        service.run(innerTenantId, () => {
          expect(service.getCurrentTenantId()).toBe(innerTenantId);
        });

        // Should revert to outer context after inner run completes
        expect(service.getCurrentTenantId()).toBe(outerTenantId);
      });

      // Should be null after all contexts exit
      expect(service.getCurrentTenantId()).toBeNull();
    });
  });

  describe("run", () => {
    it("should execute the callback with the tenant id in context", () => {
      const testTenantId = "test-tenant-id";
      const mockFn = jest.fn();

      service.run(testTenantId, mockFn);

      expect(mockFn).toHaveBeenCalled();
    });

    it("should return the result of the callback", () => {
      const testTenantId = "test-tenant-id";
      const expectedResult = { success: true };

      const result = service.run(testTenantId, () => expectedResult);

      expect(result).toEqual(expectedResult);
    });

    it("should propagate errors from the callback", () => {
      const testTenantId = "test-tenant-id";
      const testError = new Error("Test error");

      expect(() => {
        service.run(testTenantId, () => {
          throw testError;
        });
      }).toThrow(testError);
    });
  });

  describe("runAsync", () => {
    it("should execute the async callback with the tenant id in context", async () => {
      const testTenantId = "test-tenant-id";
      const mockFn = jest.fn().mockResolvedValue(undefined);

      await service.runAsync(testTenantId, mockFn);

      expect(mockFn).toHaveBeenCalled();
    });

    it("should return the result of the async callback", async () => {
      const testTenantId = "test-tenant-id";
      const expectedResult = { success: true };

      const result = await service.runAsync(
        testTenantId,
        async () => expectedResult
      );

      expect(result).toEqual(expectedResult);
    });

    it("should propagate errors from the async callback", async () => {
      const testTenantId = "test-tenant-id";
      const testError = new Error("Test error");

      await expect(
        service.runAsync(testTenantId, async () => {
          throw testError;
        })
      ).rejects.toThrow(testError);
    });

    it("should maintain tenant context across async operations", async () => {
      const testTenantId = "test-tenant-id";

      await service.runAsync(testTenantId, async () => {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Check that tenant ID is still in context
        expect(service.getCurrentTenantId()).toBe(testTenantId);
      });

      // Should be null after context exits
      expect(service.getCurrentTenantId()).toBeNull();
    });
  });
});
