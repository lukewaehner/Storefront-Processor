import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// Define a type for the extended Prisma client
// This helps with type safety when using the tenant-specific client
export type TenantPrismaClient = PrismaClient;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Creates a new Prisma client instance extended with tenant-specific filtering.
   * @param tenantId The ID of the tenant to scope queries to.
   * @returns A new TenantPrismaClient instance.
   */
  createPrismaForTenant(tenantId: string): TenantPrismaClient {
    if (!tenantId) {
      throw new Error(
        "Tenant ID is required to create a tenant-specific Prisma client."
      );
    }

    // Models that should not be automatically filtered by tenantId
    const EXCLUDED_MODELS = ["Tenant", "Domain", "User"]; // Assuming User model might have platform admins

    // Create a new client with tenant filtering
    const client = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL, // Ensure each tenant client uses the same DB URL
        },
      },
    }).$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // If the model is excluded, bypass tenant filtering
            if (EXCLUDED_MODELS.includes(model)) {
              return query(args);
            }

            // Type assertion for args
            const currentArgs = args as any;

            switch (operation) {
              case "findUnique":
              case "findFirst":
              case "findMany":
              case "count":
              case "aggregate":
              case "groupBy":
                currentArgs.where = { ...currentArgs.where, tenantId };
                break;
              case "create":
                currentArgs.data = { ...currentArgs.data, tenantId };
                break;
              case "createMany":
                if (Array.isArray(currentArgs.data)) {
                  currentArgs.data = currentArgs.data.map((item: any) => ({
                    ...item,
                    tenantId,
                  }));
                } else {
                  // Handle case where data might not be an array (though Prisma types usually enforce it for createMany)
                  currentArgs.data = { ...currentArgs.data, tenantId };
                }
                break;
              case "update":
              case "updateMany":
              case "upsert":
                currentArgs.where = { ...currentArgs.where, tenantId };
                if (operation === "upsert") {
                  currentArgs.create = { ...currentArgs.create, tenantId };
                  currentArgs.update = { ...currentArgs.update, tenantId };
                } else if (currentArgs.data) {
                  currentArgs.data = {
                    ...currentArgs.data,
                    tenantId: undefined,
                  }; // tenantId should not be updatable directly this way
                }
                break;
              case "delete":
              case "deleteMany":
                currentArgs.where = { ...currentArgs.where, tenantId };
                break;
              default:
                // For any other operation, or if specific handling isn't needed,
                // ensure tenantId is part of the where clause if 'where' exists
                if (currentArgs.where) {
                  currentArgs.where = { ...currentArgs.where, tenantId };
                }
            }
            return query(currentArgs);
          },
        },
      },
    });

    return client as unknown as TenantPrismaClient;
  }
}
