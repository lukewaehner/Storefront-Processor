import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { TenantService } from "../services/tenant.service";
import { CreateTenantDto } from "../dto/create-tenant.dto";
import { UpdateTenantDto } from "../dto/update-tenant.dto";
import { TenantStatus } from "@prisma/client";

@Controller("admin/tenants")
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.tenantService.findById(id);
  }

  @Post()
  create(@Body() data: CreateTenantDto) {
    return this.tenantService.create(data);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() data: UpdateTenantDto) {
    return this.tenantService.update(id, data);
  }

  @Put(":id/status")
  updateStatus(@Param("id") id: string, @Body("status") status: TenantStatus) {
    return this.tenantService.updateStatus(id, status);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.tenantService.delete(id);
  }
}
