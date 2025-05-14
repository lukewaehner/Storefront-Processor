import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ["query", "info", "warn", "error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method to create a tenant-specific Prisma client
  createPrismaForTenant(tenantId: string): PrismaClient {
    console.warn(`Using unfiltered Prisma client for tenant: ${tenantId}`);

    // In the future, we'll implement proper filtering here
    // For now, just return the existing client
    return this;
  }
}
