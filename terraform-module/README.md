<h1 align="center">
  🔋 Pleo SPA - Terraform Module
</h1>

This module creates a complete infrastructure set needed to serve a SPA (Single
Page App) on AWS using the cursor files for deployment. Features of this setup:

- Atomic deployments and instant rollback using per-branch cursor files and
  Lambda@Edge
- Optimal latency for infinitely cache-able static assets (on `/static/`
  route) - no edge compute in path
- CDN-level caching for HTML files and other `.well-known` files
- Preview deployments on subdomains in staging environment
- Security custom headers and blocking robots in staging
- Origin bucket protection with OAI, so files can only be accessed via
  Cloudfront

All the resources are created by nested submodules, refer to the documentation
of those for details.

## How to use

```hcl
module "my_spa" {
  source = ".git@github.com:pleo-io/spa-tools.git//terraform-module?ref=<some_release>"

  app_name      = "my-spa-project"
  subdomain     = "my-spa"
  bucket_prefix = "my-org"

  env         = "staging"
  zone_domain = "example.com"
  providers = {
    aws.global = aws.global
  }
}
```

## AWS Providers

Note that there are two AWS providers, since we need to access two AWS regions

- all the CDN infra (lambdas, cert) lives in "us-east-1" region (this is
  required by AWS)
- the S3 bucket for origin lives in the default region

<!-- BEGIN_TF_DOCS -->
#### Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 3.75.2 |

#### Providers

No providers.

#### Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_cdn"></a> [cdn](#module\_cdn) | ./modules/frontend-spa-cdn | n/a |
| <a name="module_certificate"></a> [certificate](#module\_certificate) | ./modules/frontend-spa-certificate | n/a |
| <a name="module_dns"></a> [dns](#module\_dns) | ./modules/frontend-spa-dns | n/a |
| <a name="module_lambda_role"></a> [lambda\_role](#module\_lambda\_role) | ./modules/frontend-spa-lambda-role | n/a |
| <a name="module_lambdas"></a> [lambdas](#module\_lambdas) | ./modules/frontend-spa-edge-lambda | n/a |
| <a name="module_s3"></a> [s3](#module\_s3) | ./modules/frontend-spa-s3 | n/a |

#### Resources

No resources.

#### Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_app_name"></a> [app\_name](#input\_app\_name) | Name of the app (kebab-case) | `string` | n/a | yes |
| <a name="input_block_iframes"></a> [block\_iframes](#input\_block\_iframes) | Should add custom header blocking access via iframes? | `bool` | `true` | no |
| <a name="input_bucket_prefix"></a> [bucket\_prefix](#input\_bucket\_prefix) | Prefix for the bucket name. Since S3 bucket live in global scope, it's good prefix it with e.g. your org name | `string` | n/a | yes |
| <a name="input_default_repo_branch_name"></a> [default\_repo\_branch\_name](#input\_default\_repo\_branch\_name) | Name of the default branch of the project repo | `string` | `"master"` | no |
| <a name="input_env"></a> [env](#input\_env) | Environment (production/staging) | `string` | n/a | yes |
| <a name="input_is_indexed"></a> [is\_indexed](#input\_is\_indexed) | Should allow search engine indexing in production? | `bool` | `true` | no |
| <a name="input_is_localised"></a> [is\_localised](#input\_is\_localised) | Should fetch translation hash and add cookie & preload header for translation files? | `bool` | `false` | no |
| <a name="input_subdomain"></a> [subdomain](#input\_subdomain) | Subdomain where the app lives (e.g. 'hello' if the app lives at hello.example.com) | `string` | n/a | yes |
| <a name="input_zone_domain"></a> [zone\_domain](#input\_zone\_domain) | The domain where the app lives (e.g. 'example.com' if the app lives at hello.example.com) | `string` | n/a | yes |

#### Outputs

| Name | Description |
|------|-------------|
| <a name="output_bucket_deployer_iam_policy_arn"></a> [bucket\_deployer\_iam\_policy\_arn](#output\_bucket\_deployer\_iam\_policy\_arn) | n/a |
<!-- END_TF_DOCS -->
