variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "app_name" {
  description = "Name of the app (kebab-case)"
  type        = string
}

variable "bucket_prefix" {
  description = "Prefix for the bucket name. Since S3 bucket live in global scope, it's good prefix it with e.g. your org name"
  type        = string
}

variable "zone_domain" {
  description = "The domain where the app lives (e.g. 'example.com' if the app lives at hello.example.com)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain where the app lives (e.g. 'hello' if the app lives at hello.example.com)"
  type        = string
}

variable "block_iframes" {
  description = "Should add custom header blocking access via iframes?"
  default     = true
  type        = bool
}

variable "is_localised" {
  description = "Should fetch translation hash and add cookie & preload header for translation files?"
  default     = false
  type        = bool
}

variable "default_repo_branch_name" {
  description = "Name of the default branch of the project repo"
  default     = "master"
  type        = string
}

variable "is_indexed" {
  description = "Should allow search engine indexing in production?"
  default     = true
  type        = bool
}
