variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "app_name" {
  description = "Name of the app (kebab-case)"
  type        = string
}

variable "role_arn" {
  description = "ARN of the lambda execution role"
  type        = string
}

variable "block_iframes" {
  description = "Should add custom header blocking access via iframes?"
  default     = true
  type        = bool
}

variable "is_localised" {
  description = "Should fetch translation hash and add cookie & preload header for translation files?"
  default     = true
  type        = bool
}

variable "event_type" {
  description = "Type of the Lambda@Edge (viewer-request, viewer-response, origin-request, origin-response)"
  type        = string
}

variable "default_repo_branch_name" {
  description = "Name of the default branch of the project repo"
  default     = "master"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 origin bucket"
  type        = string
}

variable "bucket_region" {
  description = "AWS region where the origin bucket is located"
  default     = "eu-west-1"
  type        = string
}

variable "domain_name" {
  description = "App domain name"
  type        = string
}