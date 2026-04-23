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

variable "delete_old_deploys_after_days" {
  description = "Number of days after which old deployment files are deleted via a lifecycle rule. null disables the rule."
  type        = number
  default     = null
  nullable    = true
}
