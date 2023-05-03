# Setup for SSL cerificate and DNS records needed to serve the CloudFront distribution
# with a custom domain

# Finding the exsting Route 53 public and private Hosted Zones
data "aws_route53_zone" "public" {
  name         = var.zone_domain
  private_zone = false
}
data "aws_route53_zone" "private" {
  name         = var.zone_domain
  private_zone = true
}

# Create DNS entries in public and private hosted zones pointing to the CDN distribution.
# In production we only need the naked domain, while in staging we also need the wildcard
# to support feature branch deployments
locals {
  naked = {
    "public-naked" : [var.domain_name, data.aws_route53_zone.public.zone_id],
    "private-naked" : [var.domain_name, data.aws_route53_zone.private.zone_id]
  }
  wildcard = {
    "public-wildcard" : ["*.${var.domain_name}", data.aws_route53_zone.public.zone_id],
    "private-wildcard" : ["*.${var.domain_name}", data.aws_route53_zone.private.zone_id],
  }
}

resource "aws_route53_record" "dns_record" {
  for_each = lower(var.env) == "production" ? local.naked : merge(local.naked, local.wildcard)

  name    = each.value[0]
  type    = "A"
  zone_id = each.value[1]

  alias {
    name                   = var.cf_domain_name
    zone_id                = var.cf_hosted_zone_id
    evaluate_target_health = false
  }
}
