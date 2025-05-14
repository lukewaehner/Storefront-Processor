import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsObject,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { TenantStatus as PrismaTenantStatus } from "@prisma/client";

// Export Prisma's TenantStatus for use in DTOs
export { PrismaTenantStatus as TenantStatus };

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsNotEmpty()
  isPrimary: boolean;

  @IsNotEmpty()
  isCustom: boolean;
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsEnum(PrismaTenantStatus)
  status: PrismaTenantStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDomainDto)
  domains: CreateDomainDto[];

  @IsString()
  @IsOptional()
  plan?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
