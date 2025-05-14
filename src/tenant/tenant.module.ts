import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from "@nestjs/common";
import { TenantController } from "./controllers/tenant.controller";
import { TenantService } from "./services/tenant.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TenantMiddleware } from "./middleware/tenant.middleware";

@Module({
  imports: [PrismaModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
