variable "environment" {
  description = "The environment name (dev, staging, production)"
  type        = string
}

variable "vpc_id" {
  description = "The VPC ID where security groups will be created"
  type        = string
}

variable "frontend_container_port" {
  description = "The port on which the frontend container will listen"
  type        = number
  default     = 3000
}

variable "backend_container_port" {
  description = "The port on which the backend container will listen"
  type        = number
  default     = 4000
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default     = {}
} 