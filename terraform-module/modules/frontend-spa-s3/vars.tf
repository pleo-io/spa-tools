variable "env" {
  description = "Environment (production/staging)"
  type        = string
}
variable "bucket_prefix" {
  description = "Prefix for the bucket name. Since S3 bucket live in global scope, it's good prefix it with e.g. your org name"
  type        = string
}

variable "app_name" {
  description = "Name of the app (kebab-case)"
  type        = string
}

