import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsObject,
  IsEnum,
  ValidateNested,
} from "class-validator";
import { TenantStatus, CreateDomainDto } from "./create-tenant.dto";
import { Type } from "class-transformer";

export class UpdateDomainDto extends CreateDomainDto {}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDomainDto)
  @IsOptional()
  domains?: UpdateDomainDto[];

  @IsString()
  @IsOptional()
  plan?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}
