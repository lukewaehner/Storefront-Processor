import { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: string; // User ID
  email: string; // User email
  role: UserRole; // User role
  tenantId?: string; // Optional tenant ID (may be null for super admins)
}
