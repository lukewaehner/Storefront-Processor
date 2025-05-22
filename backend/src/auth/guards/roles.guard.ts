import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if a user has the required roles to access a route
   */
  canActivate(context: ExecutionContext): boolean {
    // Get the required roles from the route handler or controller
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get the user from the request
    const { user } = context.switchToHttp().getRequest();

    // If no user is found (should not happen due to JwtAuthGuard), deny access
    if (!user) {
      return false;
    }

    // Check if the user has at least one of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
