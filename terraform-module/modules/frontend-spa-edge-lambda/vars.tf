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

variable "serve_nested_index_html" {
  description = "Applies to apps which build separate index.html files for sub-routes, e.g. using Gatsby SSG"
  type        = bool
}

variable "region" {
  description = "AWS region for the lambda layers"
  type        = string
  default     = "us-east-1"
}

variable "steward_team" {
  description = "Steward team name for OTEL resource attributes"
  type        = string
}

variable "cost_allocation_team" {
  description = "Cost allocation team for OTEL resource attributes"
  type        = string
}

variable "otel_collector_lambda_arn" {
  description = "ARN of the Lambda function that processes logs for OTEL collector"
  type        = string
}

variable "enable_log_forwarding" {
  description = "Enable CloudWatch log subscription filter to forward logs to OTEL collector"
  type        = bool
  default     = true
}
