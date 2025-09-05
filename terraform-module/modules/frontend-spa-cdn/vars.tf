variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "app_name" {
  description = "Name of the app (kebab-case)"
  type        = string
}

variable "domain_name" {
  description = "App domain name"
  type        = string
}

variable "cloudfront_price_class" {
  description = "CloudFront distribution price class"
  type        = string
  default     = "PriceClass_100"
}

variable "bucket_regional_domain_name" {
  description = "The S3 origin bucket region-specific domain name."
  type        = string
}

variable "bucket_name" {
  description = "The S3 origin bucket name."
  type        = string
}

variable "cloudfront_access_identity_path" {
  description = "A shortcut to the full path for the origin access identity."
  type        = string
}

variable "acm_certificate_arn" {
  description = "Amazon Resource Name of the ACM certificate"
  type        = string
}

variable "edge_lambdas" {
  description = "List of Lambda@Edge lambdas to associate"
  type = list(object({
    event_type = string
    arn        = string
  }))
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

variable "is_robots_indexing_allowed" {
  description = "Should allow search engine indexing in production?"
  default     = true
  type        = bool
}

variable "cloudwatch_access_logs" {
  description = "Enable CloudWatch access logs"
  default     = true
  type        = bool
}
