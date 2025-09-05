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
  description = "Level of iframe control. 'all' blocks all iframes (X-Frame-Options: DENY), 'cross_origin' allows same-origin iframes only (X-Frame-Options: SAMEORIGIN), 'none' allows all iframes (no X-Frame-Options header)"
  default     = "all"
  type        = string
  validation {
    condition     = contains(["all", "none", "cross_origin"], var.block_iframes)
    error_message = "block_iframes must be one of: all, none, or cross_origin."
  }
}

variable "content_frame_ancestors" {
  description = "Level of CSP header's frame-ancestors control. 'none' means there are no valid parents that may embed the page (Content-Security-Policy: frame-ancestors 'none'), 'same_origin' allows same-origin embedding only (Content-Security-Policy: frame-ancestors 'self'), 'all' allows all iframes (no Content-Security-Policy header)"
  default     = "none"
  type        = string
  validation {
    condition     = contains(["none", "same_origin", "all"], var.content_frame_ancestors)
    error_message = "content_frame_ancestors must be one of: none, same_origin, or all."
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
