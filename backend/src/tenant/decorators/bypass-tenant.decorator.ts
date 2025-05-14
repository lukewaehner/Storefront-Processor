import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key used to mark a route as bypassing tenant check
 */
export const BYPASS_TENANT_KEY = "bypassTenant";

/**
 * Decorator that allows a route to bypass tenant validation
 *
 * When applied to a controller or a route handler, the TenantGuard will
 * not check for the presence of a tenant in the request
 *
 * @example
 * ```typescript
 * @BypassTenant()
 * @Get('/platform-stats')
 * getPlatformStats() {
 *   // This endpoint will be accessible without a tenant
 * }
 * ```
 */
export const BypassTenant = () => SetMetadata(BYPASS_TENANT_KEY, true);
