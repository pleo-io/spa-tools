# Pleo SPA Terraform Module - CDN

Creates a CloudFront CDN distribution for an SPA app.

## How to use

```hcl
module "cdn" {
  source      = "./modules/frontend-spa-cdn"
  app_name    = "hello-app"
  env         = "production"
  domain_name = "hello.example.com"
  bucket_name = module.s3.bucket_name

  bucket_regional_domain_name     = module.s3.bucket_regional_domain_name
  cloudfront_access_identity_path = module.s3.cloudfront_access_identity_path
  edge_lambdas = [
    for event_type, lambda in module.lambdas : { event_type = event_type, arn = lambda.lambda_arn }
  ]
  acm_certificate_arn = module.certificate.certificate_arn
}
```

<!-- BEGIN_TF_DOCS -->
#### Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 3.75.2 |

#### Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | >= 3.75.2 |

#### Modules

No modules.

#### Resources

| Name | Type |
|------|------|
| [aws_cloudfront_distribution.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution) | resource |
| [aws_s3_bucket_object.object](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_object) | resource |

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_acm_certificate_arn"></a> [acm\_certificate\_arn](#input\_acm\_certificate\_arn) | Amazon Resource Name of the ACM certificate | `string` | n/a | yes |
| <a name="input_app_name"></a> [app\_name](#input\_app\_name) | Name of the app (kebab-case) | `string` | n/a | yes |
| <a name="input_bucket_name"></a> [bucket\_name](#input\_bucket\_name) | The S3 origin bucket name. | `string` | n/a | yes |
| <a name="input_bucket_regional_domain_name"></a> [bucket\_regional\_domain\_name](#input\_bucket\_regional\_domain\_name) | The S3 origin bucket region-specific domain name. | `string` | n/a | yes |
| <a name="input_cloudfront_access_identity_path"></a> [cloudfront\_access\_identity\_path](#input\_cloudfront\_access\_identity\_path) | A shortcut to the full path for the origin access identity. | `string` | n/a | yes |
| <a name="input_cloudfront_price_class"></a> [cloudfront\_price\_class](#input\_cloudfront\_price\_class) | CloudFront distribution price class | `string` | `"PriceClass_100"` | no |
| <a name="input_domain_name"></a> [domain\_name](#input\_domain\_name) | App domain name | `string` | n/a | yes |
| <a name="input_edge_lambdas"></a> [edge\_lambdas](#input\_edge\_lambdas) | List of Lambda@Edge lambdas to associate | <pre>list(object({<br>    event_type = string<br>    arn        = string<br>  }))</pre> | n/a | yes |
| <a name="input_env"></a> [env](#input\_env) | Environment (production/staging) | `string` | n/a | yes |

#### Outputs

| Name | Description |
|------|-------------|
| <a name="output_cf_domain_name"></a> [cf\_domain\_name](#output\_cf\_domain\_name) | n/a |
| <a name="output_cf_hosted_zone_id"></a> [cf\_hosted\_zone\_id](#output\_cf\_hosted\_zone\_id) | n/a |
<!-- END_TF_DOCS -->
