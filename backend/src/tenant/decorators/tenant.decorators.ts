import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TenantRequest } from "../interfaces/tenant-request.interface";

/**
 * Extracts the current tenant from the request object.
 * Usage: @GetTenant() tenant: Tenant
 */
export const GetTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenant;
  }
);

/**
 * Extracts the current tenant ID from the request object.
 * Usage: @GetTenantId() tenantId: string
 */
export const GetTenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenant?.id;
  }
);
