/// <reference types="jest" />
import { Test, TestingModule } from "@nestjs/testing";
import { TenantContextService } from "./tenant-context.service";

describe("TenantContextService", () => {
  let service: TenantContextService;
  const testTenantId = "test-tenant-id";

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
    it("should return null when no tenant ID is set", () => {
      expect(service.getCurrentTenantId()).toBeNull();
    });

    it("should return the tenant ID when set via run()", () => {
      service.run(testTenantId, () => {
        expect(service.getCurrentTenantId()).toBe(testTenantId);
      });
    });

    it("should return the tenant ID when set via runAsync()", async () => {
      await service.runAsync(testTenantId, async () => {
        expect(service.getCurrentTenantId()).toBe(testTenantId);
      });
    });
  });

  describe("run", () => {
    it("should execute the callback with tenant ID set in context", () => {
      let callbackExecuted = false;
      let tenantIdInCallback: string | null = null;

      service.run(testTenantId, () => {
        callbackExecuted = true;
        tenantIdInCallback = service.getCurrentTenantId();
        return "result";
      });

      expect(callbackExecuted).toBe(true);
      expect(tenantIdInCallback).toBe(testTenantId);
    });

    it("should return the result of the callback", () => {
      const result = service.run(testTenantId, () => "test-result");
      expect(result).toBe("test-result");
    });

    it("should properly restore context after execution", () => {
      // Initially no tenant ID
      expect(service.getCurrentTenantId()).toBeNull();

      // Set tenant ID via run
      service.run(testTenantId, () => {
        expect(service.getCurrentTenantId()).toBe(testTenantId);
      });

      // Should be reset after run completes
      expect(service.getCurrentTenantId()).toBeNull();
    });

    it("should propagate errors from callback", () => {
      const testError = new Error("Test error");
      expect(() => {
        service.run(testTenantId, () => {
          throw testError;
        });
      }).toThrow(testError);
    });
  });

  describe("runAsync", () => {
    it("should execute the async callback with tenant ID set in context", async () => {
      let callbackExecuted = false;
      let tenantIdInCallback: string | null = null;

      await service.runAsync(testTenantId, async () => {
        callbackExecuted = true;
        tenantIdInCallback = service.getCurrentTenantId();
      });

      expect(callbackExecuted).toBe(true);
      expect(tenantIdInCallback).toBe(testTenantId);
    });

    it("should return the result of the async callback", async () => {
      const result = await service.runAsync(
        testTenantId,
        async () => "test-result"
      );
      expect(result).toBe("test-result");
    });

    it("should properly restore context after execution", async () => {
      // Initially no tenant ID
      expect(service.getCurrentTenantId()).toBeNull();

      // Set tenant ID via runAsync
      await service.runAsync(testTenantId, async () => {
        expect(service.getCurrentTenantId()).toBe(testTenantId);
      });

      // Should be reset after runAsync completes
      expect(service.getCurrentTenantId()).toBeNull();
    });

    it("should propagate errors from async callback", async () => {
      const testError = new Error("Test error");
      await expect(
        service.runAsync(testTenantId, async () => {
          throw testError;
        })
      ).rejects.toThrow(testError);
    });
  });
});
