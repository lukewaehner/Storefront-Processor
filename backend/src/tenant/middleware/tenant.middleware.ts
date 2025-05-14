import { Injectable, NestMiddleware, NotFoundException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { TenantService } from "../services/tenant.service";
import { TenantContextService } from "../services/tenant-context.service";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly tenantContextService: TenantContextService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const hostname = req.hostname;

    // Skip tenant resolution for admin routes
    if (req.path.startsWith("/admin")) {
      return next();
    }

    try {
      // Find tenant by domain
      const tenant = await this.tenantService.findByDomain(hostname);

      if (!tenant) {
        res.status(404).json({
          statusCode: 404,
          message: `Tenant not found for domain: ${hostname}`,
        });
        return;
      }

      // Attach tenant to request object
      req["tenant"] = tenant;

      // Use the runAsync method to set tenant in context and execute the next middleware
      return this.tenantContextService.runAsync(tenant.id, async () => {
        next();
      });
    } catch (error) {
      // For errors, pass to the global exception filter
      next(error);
    }
  }
}
