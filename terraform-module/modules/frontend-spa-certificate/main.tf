# Provision a certificate for the app domain (with wildcard alternative name 
# for feature branch deployments in staging).
# AWS requires certificates for CloudFront distributions to be created in the 
# global AWS region (us-east-1)

# Finding the exsting Route 53 public Hosted Zone
data "aws_route53_zone" "public" {
  name         = var.zone_domain
  private_zone = false
}
resource "aws_acm_certificate" "this" {
  provider          = aws.global
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = lower(var.env) == "production" ? [] : ["*.${var.domain_name}"]

  tags = {
    Environment = var.env
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Validating the certificate using the DNS method, which allows to manage it all from Terraform
resource "aws_route53_record" "records" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.public.zone_id
}

resource "aws_acm_certificate_validation" "validation" {
  provider                = aws.global
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for record in aws_route53_record.records : record.fqdn]
}
