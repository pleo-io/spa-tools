resource "github_repository_environment" "this" {
  repository  = var.repo_name
  environment = var.env_name
  reviewers {
    teams = var.reviewer_teams
  }

  dynamic "deployment_branch_policy" {
    for_each = var.protected_branches == false ? [] : [1]
    content {
      protected_branches     = true
      custom_branch_policies = false
    }
  }
}

resource "github_actions_environment_secret" "access_key_id" {
  repository      = var.repo_name
  environment     = github_repository_environment.this.environment
  secret_name     = "AWS_ACCESS_KEY_ID"
  plaintext_value = var.access_key_id
}

resource "github_actions_environment_secret" "secret_access_key" {
  repository      = var.repo_name
  environment     = github_repository_environment.this.environment
  secret_name     = "AWS_SECRET_ACCESS_KEY"
  plaintext_value = var.access_key_secret
}
