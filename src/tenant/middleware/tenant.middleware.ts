import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantService } from "../services/tenant.service";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract domain from request
    const hostname = req.hostname;

    try {
      // For now, just log the domain and use a mock tenant
      console.log(`Processing request for domain: ${hostname}`);

      // Attach mock tenant to request
      (req as any).tenant = {
        id: "mock-tenant-id",
        name: "Mock Tenant",
        slug: "mock-tenant",
        status: "ACTIVE",
      };

      // Use the main prisma client for now
      (req as any).prismaClient = this.prisma;

      next();
    } catch (error) {
      console.error("Error resolving tenant:", error);
      next(error);
    }
  }
}
