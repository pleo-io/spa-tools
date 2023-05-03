locals {
  domain_name = "${var.subdomain}.${var.zone_domain}"
}

module "s3" {
  source        = "./modules/frontend-spa-s3"
  app_name      = var.app_name
  bucket_prefix = var.bucket_prefix
  env           = var.env
}

module "lambda_role" {
  source     = "./modules/frontend-spa-lambda-role"
  app_name   = var.app_name
  env        = var.env
  bucket_arn = module.s3.bucket_arn
}

module "lambdas" {
  for_each                 = toset(["viewer-response", "viewer-request"])
  source                   = "./modules/frontend-spa-edge-lambda"
  app_name                 = var.app_name
  event_type               = each.key
  role_arn                 = module.lambda_role.role_arn
  env                      = var.env
  block_iframes            = var.block_iframes
  is_localised             = var.is_localised
  default_repo_branch_name = var.default_repo_branch_name
  bucket_name              = module.s3.bucket_name
  bucket_region            = module.s3.bucket_region
  domain_name              = local.domain_name

  providers = {
    aws.global = aws.global
  }
}

module "certificate" {
  source = "./modules/frontend-spa-certificate"

  env         = var.env
  zone_domain = var.zone_domain
  domain_name = local.domain_name

  providers = {
    aws.global = aws.global
  }
}

module "cdn" {
  source      = "./modules/frontend-spa-cdn"
  app_name    = var.app_name
  env         = var.env
  domain_name = local.domain_name
  bucket_name = module.s3.bucket_name

  bucket_regional_domain_name     = module.s3.bucket_regional_domain_name
  cloudfront_access_identity_path = module.s3.cloudfront_access_identity_path
  edge_lambdas = [
    for event_type, lambda in module.lambdas : { event_type = event_type, arn = lambda.lambda_arn }
  ]
  acm_certificate_arn = module.certificate.certificate_arn
}

module "dns" {
  source = "./modules/frontend-spa-dns"
  env    = var.env

  zone_domain = var.zone_domain
  domain_name = local.domain_name

  cf_hosted_zone_id = module.cdn.cf_hosted_zone_id
  cf_domain_name    = module.cdn.cf_domain_name
}