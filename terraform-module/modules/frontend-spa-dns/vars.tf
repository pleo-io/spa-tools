variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "zone_domain" {
  description = "The domain where the app lives (e.g. 'example.com' if the app lives at hello.example.com)"
  type        = string
}

variable "domain_name" {
  description = "App domain name"
  type        = string
}

variable "cf_domain_name" {
  description = "The domain name corresponding to the CloudFront distribution."
  type        = string
}

variable "cf_hosted_zone_id" {
  description = "The CloudFront Distribution Route 53 zone ID"
  type        = string
}
