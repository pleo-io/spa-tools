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
