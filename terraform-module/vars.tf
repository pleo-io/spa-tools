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
  description = "Level of iframe control. Sets X-Frame-Options header to DENY (block all), SAMEORIGIN (allow same origin), or ALLOWALL (allow all)"
  default     = "DENY"
  type        = string
  validation {
    condition     = contains(["DENY", "SAMEORIGIN", "ALLOWALL"], var.block_iframes)
    error_message = "block_iframes must be one of: DENY, SAMEORIGIN, or ALLOWALL."
  }
}

variable "default_repo_branch_name" {
  description = "Name of the default branch of the project repo"
  default     = "master"
  type        = string
}

variable "is_robots_indexing_allowed" {
  description = "Should allow search engine indexing in production?"
  default     = true
  type        = bool
}

variable "serve_nested_index_html" {
  description = "Applies to apps which build separate index.html files for sub-routes, e.g. using Gatsby SSG"
  type        = bool
}

variable "certificate_additional_sans" {
  description = "Additional subject alternative names to include in the certificate"
  type        = list(string)
  default     = []
}
