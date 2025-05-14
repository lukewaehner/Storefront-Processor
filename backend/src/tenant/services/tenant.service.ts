import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTenantDto } from "../dto/create-tenant.dto";
import { UpdateTenantDto } from "../dto/update-tenant.dto";
import { TenantStatus } from "@prisma/client";

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: { domains: true },
    });
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: { domains: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { domains: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }

    return tenant;
  }

  async findByDomain(domain: string) {
    const domainRecord = await this.prisma.domain.findFirst({
      where: { domain },
      include: { tenant: true },
    });

    return domainRecord?.tenant || null;
  }

  async create(createTenantDto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        status: createTenantDto.status,
        domains: {
          create: createTenantDto.domains,
        },
      },
      include: {
        domains: true,
      },
    });
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findById(id); // Check if tenant exists

    // Handle domains separately if included in the update
    const { domains, ...data } = updateTenantDto;

    return this.prisma.tenant.update({
      where: { id },
      data,
      include: {
        domains: true,
      },
    });
  }

  async updateStatus(id: string, status: TenantStatus) {
    await this.findById(id); // Check if tenant exists

    return this.prisma.tenant.update({
      where: { id },
      data: { status },
      include: { domains: true },
    });
  }

  async delete(id: string) {
    await this.findById(id); // Check if tenant exists

    return this.prisma.tenant.delete({
      where: { id },
      include: { domains: true },
    });
  }
}
