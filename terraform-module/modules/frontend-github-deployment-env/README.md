# GitHub Deployment Environment

Creates a GitHub deployment environment, and injects provided AWS credentials
into that new environment's secrets. See GitHub documentation on
[GitHub deployment environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment).

## How to use

```hcl
module "deployment_env" {
  source = "git@github.com:pleo-io/spa-tools.git//terraform-module/modules/frontend-github-deployment-env?ref=terraform-module-v3.1.1"

  repo_name          = "my-repo"
  env_name           = "staging"
  access_key_id      = aws_iam_access_key.key.id
  access_key_secret  = aws_iam_access_key.key.secret
}
```

<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | >= 4.0 |
| <a name="requirement_github"></a> [github](#requirement\_github) | ~> 5.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_github"></a> [github](#provider\_github) | ~> 5.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [github_actions_environment_secret.access_key_id](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_actions_environment_secret.secret_access_key](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/actions_environment_secret) | resource |
| [github_repository_environment.this](https://registry.terraform.io/providers/integrations/github/latest/docs/resources/repository_environment) | resource |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_access_key_id"></a> [access\_key\_id](#input\_access\_key\_id) | AWS access key ID | `string` | n/a | yes |
| <a name="input_access_key_secret"></a> [access\_key\_secret](#input\_access\_key\_secret) | AWS secret access key | `string` | n/a | yes |
| <a name="input_env_name"></a> [env\_name](#input\_env\_name) | Name of the environment | `string` | n/a | yes |
| <a name="input_repo_name"></a> [repo\_name](#input\_repo\_name) | Name of the repository to create the environment | `string` | n/a | yes |
| <a name="input_protected_branches"></a> [protected\_branches](#input\_protected\_branches) | Whether only branches with branch protection rules can deploy to this environment. | `bool` | `false` | no |
| <a name="input_reviewer_teams"></a> [reviewer\_teams](#input\_reviewer\_teams) | List of up to 6 IDs of teams required to review a deployment to the environment | `list(string)` | `[]` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->
