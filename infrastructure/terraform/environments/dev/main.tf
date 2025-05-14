provider "aws" {
  region = var.aws_region
}

locals {
  environment = "dev"
  common_tags = {
    Environment = local.environment
    Project     = "storefront-processor"
    ManagedBy   = "terraform"
  }
}

# Create S3 bucket for Terraform state
resource "aws_s3_bucket" "terraform_state" {
  bucket = "storefront-terraform-state-${local.environment}"

  # Prevent accidental deletion of this S3 bucket
  lifecycle {
    prevent_destroy = true
  }

  tags = local.common_tags
}

# Enable versioning for the state bucket
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Create DynamoDB table for state locking
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "storefront-terraform-locks-${local.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = local.common_tags
}

# VPC Configuration
module "vpc" {
  source = "../../modules/vpc"

  environment           = local.environment
  vpc_cidr              = var.vpc_cidr
  availability_zones    = var.availability_zones
  public_subnet_cidrs   = var.public_subnet_cidrs
  private_subnet_cidrs  = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  common_tags           = local.common_tags
}

# Security Groups
module "security" {
  source = "../../modules/security"

  environment            = local.environment
  vpc_id                 = module.vpc.vpc_id
  frontend_container_port = var.frontend_container_port
  backend_container_port  = var.backend_container_port
  common_tags            = local.common_tags
}

# Outputs
output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = module.vpc.private_subnet_ids
}

output "database_subnet_ids" {
  description = "List of IDs of database subnets"
  value       = module.vpc.database_subnet_ids
}

output "alb_security_group_id" {
  description = "The ID of the ALB security group"
  value       = module.security.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "The ID of the ECS security group"
  value       = module.security.ecs_security_group_id
}

output "rds_security_group_id" {
  description = "The ID of the RDS security group"
  value       = module.security.rds_security_group_id
}

output "redis_security_group_id" {
  description = "The ID of the Redis security group"
  value       = module.security.redis_security_group_id
} 