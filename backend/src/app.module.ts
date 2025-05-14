import { Module } from "@nestjs/common";
// Temporarily comment out imports that have path resolution issues
// import { AppController } from "./app.controller";
// import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { TenantModule } from "./tenant/tenant.module";
import { ConfigModule } from "@nestjs/config";

// Determine the env file path based on NODE_ENV
const envFilePath = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath, // Load appropriate .env file
      ignoreEnvFile: process.env.NODE_ENV === "production", // In prod, rely on environment variables set by the hosting provider
    }),
    PrismaModule,
    TenantModule,
  ],
  // Temporarily comment out controllers and providers
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
