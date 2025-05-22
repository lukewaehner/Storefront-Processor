import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { User } from "@prisma/client";

@Controller("users")
export class UsersController {
  @Get()
  @Public()
  getPublicUsers() {
    return { message: "This endpoint is public and available to everyone" };
  }

  @Get("profile")
  getProfile(@GetUser() user: User) {
    return {
      message: "This endpoint requires authentication",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  @Get("admin")
  @Roles(UserRole.ADMIN)
  getAdminData(@GetUser() user: User) {
    return {
      message: "This endpoint requires ADMIN role",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get("super-admin")
  @Roles(UserRole.SUPER_ADMIN)
  getSuperAdminData(@GetUser() user: User) {
    return {
      message: "This endpoint requires SUPER_ADMIN role",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  @Get("staff")
  @Roles(UserRole.STAFF)
  getStaffData(@GetUser() user: User) {
    return {
      message: "This endpoint requires STAFF role",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
