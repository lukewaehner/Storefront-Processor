import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../auth/decorators/public.decorator";
import { BYPASS_TENANT_KEY } from "../decorators/bypass-tenant.decorator";
import { Request } from "express";

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // Check if the route bypasses tenant check
    const bypassTenant = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TENANT_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (bypassTenant) {
      return true;
    }

    // Get the HTTP request
    const request = context.switchToHttp().getRequest<Request>();

    // Skip tenant check for admin routes
    if (request.path.startsWith("/admin")) {
      return true;
    }

    // Check if tenant is attached to the request
    const tenant = request["tenant"];
    if (!tenant) {
      throw new UnauthorizedException(
        "Tenant not found. This resource requires a valid tenant."
      );
    }

    // Check if tenant is active
    if (tenant.status !== "ACTIVE") {
      throw new UnauthorizedException(
        `Tenant is not active. Status: ${tenant.status}`
      );
    }

    return true;
  }
}
