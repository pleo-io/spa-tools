variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "app_name" {
  description = "Name of the app (kebab-case)"
  type        = string
}

variable "bucket_arn" {
  description = "ARN of the origin bucket"
  type        = string
}
