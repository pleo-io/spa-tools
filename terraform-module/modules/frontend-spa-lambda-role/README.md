# Pleo SPA Terraform Module - Lambda Role

Create an IAM role used as an execution role by the Lambda@Edge lambdas.

## How to use

```hcl
module "lambda_role" {
  source     = "./modules/frontend-spa-lambda-role"
  app_name   = "hello-app"
  env        = "staging"
  bucket_arn = module.s3.bucket_arn
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
| [aws_iam_role.lambda_edge](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.read_origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_iam_role_policy_attachment.basic](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_policy_document.lambda_assume_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.read_origin](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_app_name"></a> [app\_name](#input\_app\_name) | Name of the app (kebab-case) | `string` | n/a | yes |
| <a name="input_bucket_arn"></a> [bucket\_arn](#input\_bucket\_arn) | ARN of the origin bucket | `string` | n/a | yes |
| <a name="input_env"></a> [env](#input\_env) | Environment (production/staging) | `string` | n/a | yes |

#### Outputs

| Name | Description |
|------|-------------|
| <a name="output_role_arn"></a> [role\_arn](#output\_role\_arn) | n/a |
<!-- END_TF_DOCS -->
