variable "env" {
  description = "Environment (production/staging)"
  type        = string
}

variable "zone_domain" {
  description = "The domain where the app lives (e.g. 'example.com' if the app lives at hello.example.com)"
  type        = string
}

variable "domain_name" {
  description = "Full domain name of the app"
  type        = string
}