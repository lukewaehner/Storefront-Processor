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

    // Define role hierarchy
    const roleHierarchy = {
      [UserRole.SUPER_ADMIN]: [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.STAFF,
        UserRole.CUSTOMER,
      ],
      [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.STAFF, UserRole.CUSTOMER],
      [UserRole.STAFF]: [UserRole.STAFF, UserRole.CUSTOMER],
      [UserRole.CUSTOMER]: [UserRole.CUSTOMER],
    };

    // Check if the user's role can access any of the required roles
    const userPermissions = roleHierarchy[user.role] || [];
    return requiredRoles.some((role) => userPermissions.includes(role));
  }
}
