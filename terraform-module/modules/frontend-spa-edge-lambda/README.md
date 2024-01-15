# Pleo SPA Terraform Module - Edge Lambda

Lambda@Edge lambdas used by the CloudFront distribution's default caching
behaviour AWS requires edge lambdas to be deployed to the global region
(us-east-1).

## How to use

```hcl
module "lambda" {
  source                   = "./modules/frontend-spa-edge-lambda"
  app_name                 = "hello-app"
  event_type               = "viewer-request"
  env                      = "production"
  domain_name              = "hello.example.com"
  default_repo_branch_name = "master"
  block_iframes            = true
  role_arn                 = module.lambda_role.role_arn
  lambda_version           = var.lambdas_version
  bucket_name              = module.s3.bucket_name
  bucket_region            = module.s3.bucket_region

  providers = {
    aws.global = aws.global
  }
}
```

## AWS Providers

Note that there are two AWS providers, since we need to access two AWS regions

- all the CDN infra (lambdas, cert) lives in "us-east-1" region (this is
  required by AWS)
- the S3 bucket for origin lives in "eu-west-1" region

<!-- BEGIN_TF_DOCS -->

#### Requirements

| Name                                                            | Version   |
| --------------------------------------------------------------- | --------- |
| <a name="requirement_aws"></a> [aws](#requirement_aws)          | >= 3.75.2 |
| <a name="requirement_github"></a> [github](#requirement_github) | ~> 4.0    |

#### Providers

| Name                                                                  | Version   |
| --------------------------------------------------------------------- | --------- |
| <a name="provider_archive"></a> [archive](#provider_archive)          | n/a       |
| <a name="provider_aws.global"></a> [aws.global](#provider_aws.global) | >= 3.75.2 |
| <a name="provider_local"></a> [local](#provider_local)                | n/a       |

#### Modules

No modules.

#### Resources

| Name                                                                                                                               | Type        |
| ---------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [aws_lambda_function.lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function)          | resource    |
| [local_file.lambda_config](https://registry.terraform.io/providers/hashicorp/local/latest/docs/resources/file)                     | resource    |
| [local_sensitive_file.lambda_source](https://registry.terraform.io/providers/hashicorp/local/latest/docs/resources/sensitive_file) | resource    |
| [archive_file.lambda](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file)                     | data source |

#### Inputs

| Name                                                                                                      | Description                                                                                | Type     | Default       | Required |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------- | :------: |
| <a name="input_app_name"></a> [app_name](#input_app_name)                                                 | Name of the app (kebab-case)                                                               | `string` | n/a           |   yes    |
| <a name="input_block_iframes"></a> [block_iframes](#input_block_iframes)                                  | Should add custom header blocking access via iframes?                                      | `bool`   | `true`        |    no    |
| <a name="input_bucket_name"></a> [bucket_name](#input_bucket_name)                                        | Name of the S3 origin bucket                                                               | `string` | n/a           |   yes    |
| <a name="input_bucket_region"></a> [bucket_region](#input_bucket_region)                                  | AWS region where the origin bucket is located                                              | `string` | `"eu-west-1"` |    no    |
| <a name="input_default_repo_branch_name"></a> [default_repo_branch_name](#input_default_repo_branch_name) | Name of the default branch of the project repo                                             | `string` | `"master"`    |    no    |
| <a name="input_domain_name"></a> [domain_name](#input_domain_name)                                        | App domain name                                                                            | `string` | n/a           |   yes    |
| <a name="input_env"></a> [env](#input_env)                                                                | Environment (production/staging)                                                           | `string` | n/a           |   yes    |
| <a name="input_event_type"></a> [event_type](#input_event_type)                                           | Type of the Lambda@Edge (viewer-request, viewer-response, origin-request, origin-response) | `string` | n/a           |   yes    |
| <a name="input_role_arn"></a> [role_arn](#input_role_arn)                                                 | ARN of the lambda execution role                                                           | `string` | n/a           |   yes    |

#### Outputs

| Name                                                              | Description |
| ----------------------------------------------------------------- | ----------- |
| <a name="output_lambda_arn"></a> [lambda_arn](#output_lambda_arn) | n/a         |

<!-- END_TF_DOCS -->
