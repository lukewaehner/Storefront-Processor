import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
// Import commented out for now due to path resolution issues
// import { TenantController } from './controllers/tenant.controller';
import { TenantService } from "./services/tenant.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TenantMiddleware } from "./middleware/tenant.middleware";
import { APP_GUARD } from "@nestjs/core";
import { TenantGuard } from "./guards/tenant.guard";
import { TenantContextService } from "./services/tenant-context.service";

@Module({
  imports: [PrismaModule],
  // Temporarily comment out controllers
  // controllers: [TenantController],
  providers: [
    TenantService,
    TenantContextService,
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [TenantService, TenantContextService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
