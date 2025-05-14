import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<string>();

  /**
   * Get the current tenant ID from the AsyncLocalStorage context
   * @returns The current tenant ID or null if not set
   */
  getCurrentTenantId(): string | null {
    return this.storage.getStore() || null;
  }

  /**
   * Run a synchronous function with the specified tenant ID in context
   * @param tenantId The tenant ID to set in context
   * @param callback The function to run with the tenant ID in context
   * @returns The result of the callback function
   */
  run<T>(tenantId: string, callback: () => T): T {
    return this.storage.run(tenantId, callback);
  }

  /**
   * Run an asynchronous function with the specified tenant ID in context
   * @param tenantId The tenant ID to set in context
   * @param callback The async function to run with the tenant ID in context
   * @returns A promise resolving to the result of the callback function
   */
  async runAsync<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    return this.storage.run(tenantId, callback);
  }

  /**
   * Clear the current tenant ID from the AsyncLocalStorage context
   * This is primarily used for testing purposes
   */
  clear(): void {
    // AsyncLocalStorage doesn't have a clear method, but we can
    // exit the context by running a no-op function with no store
    this.storage.run(null, () => {});
  }
}
