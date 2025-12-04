# variables.tf - Input variables for Terraform configuration

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "nameria-dnd"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Custom domain name"
  type        = string
  default     = "mcnattcloud.com"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "Nameria"
    Environment = "prod"
    ManagedBy   = "Terraform"
    Course      = "IS531"
  }
}

