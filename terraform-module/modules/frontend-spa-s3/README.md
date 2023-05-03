# Pleo SPA Terraform Module - S3

S3 bucket which serves as the origin for the CDN distribution Stores:

- cursor files specifying the current active deployment for each branch
- HTML files served by the default cache behaviour
- static fiels served by the ordered cache behaviour This bucket has restricted
  access, and is only open for:
- read for the CloudFront disutribution (via OAI)
- read for the Lambda@Edge via lambda execution role
- read and write for GitHub Actions via deployer user (not created by this
  module)

## How to use

```hcl
module "s3" {
  source        = "./modules/frontend-spa-s3"
  app_name      = "my-app"
  bucket_prefix = "my-org"
  env           = "staging"
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
| [aws_cloudfront_origin_access_identity.oai](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudfront_origin_access_identity) | resource |
| [aws_iam_policy.read_write_origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_s3_bucket.origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket) | resource |
| [aws_s3_bucket_acl.origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_acl) | resource |
| [aws_s3_bucket_policy.oai_read](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy) | resource |
| [aws_s3_bucket_public_access_block.origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block) | resource |
| [aws_iam_policy_document.read_write_origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.s3_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_app_name"></a> [app\_name](#input\_app\_name) | Name of the app (kebab-case) | `string` | n/a | yes |
| <a name="input_bucket_prefix"></a> [bucket\_prefix](#input\_bucket\_prefix) | Prefix for the bucket name. Since S3 bucket live in global scope, it's good prefix it with e.g. your org name | `string` | n/a | yes |
| <a name="input_env"></a> [env](#input\_env) | Environment (production/staging) | `string` | n/a | yes |

#### Outputs

| Name | Description |
|------|-------------|
| <a name="output_bucket_arn"></a> [bucket\_arn](#output\_bucket\_arn) | n/a |
| <a name="output_bucket_deployer_iam_policy"></a> [bucket\_deployer\_iam\_policy](#output\_bucket\_deployer\_iam\_policy) | n/a |
| <a name="output_bucket_name"></a> [bucket\_name](#output\_bucket\_name) | n/a |
| <a name="output_bucket_region"></a> [bucket\_region](#output\_bucket\_region) | n/a |
| <a name="output_bucket_regional_domain_name"></a> [bucket\_regional\_domain\_name](#output\_bucket\_regional\_domain\_name) | n/a |
| <a name="output_cloudfront_access_identity_path"></a> [cloudfront\_access\_identity\_path](#output\_cloudfront\_access\_identity\_path) | n/a |
<!-- END_TF_DOCS -->
