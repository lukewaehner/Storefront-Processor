import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

class TenantThemeSettings {
  @IsString()
  @IsNotEmpty()
  primaryColor: string;

  @IsString()
  @IsNotEmpty()
  secondaryColor: string;

  @IsString()
  @IsNotEmpty()
  accentColor: string;

  @IsString()
  @IsNotEmpty()
  fontFamily: string;
}

class TenantFeatureSettings {
  @IsBoolean()
  enableReviews: boolean;

  @IsBoolean()
  enableWishlist: boolean;

  @IsBoolean()
  enableComparisons: boolean;
}

class TenantContactSettings {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

class TenantSettings {
  @ValidateNested()
  @Type(() => TenantThemeSettings)
  theme: TenantThemeSettings;

  @ValidateNested()
  @Type(() => TenantFeatureSettings)
  features: TenantFeatureSettings;

  @ValidateNested()
  @Type(() => TenantContactSettings)
  contact: TenantContactSettings;
}

class DomainDto {
  @IsString()
  @IsNotEmpty()
  domain: string;

  @IsBoolean()
  isPrimary: boolean;

  @IsBoolean()
  isCustom: boolean;
}

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @ValidateNested({ each: true })
  @Type(() => DomainDto)
  domains: DomainDto[];

  @ValidateNested()
  @Type(() => TenantSettings)
  @IsOptional()
  settings?: TenantSettings;
}
