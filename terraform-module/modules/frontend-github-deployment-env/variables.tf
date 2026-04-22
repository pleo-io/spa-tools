variable "repo_name" {
  description = "Name of the repository to create the environment"
  type        = string
}

variable "env_name" {
  description = "Name of the environment"
  type        = string
}

variable "access_key_id" {
  description = "AWS access key ID"
  type        = string
}

variable "access_key_secret" {
  description = "AWS secret access key"
  type        = string
}

variable "protected_branches" {
  description = "Whether only branches with branch protection rules can deploy to this environment."
  type        = bool
  default     = false
}

variable "reviewer_teams" {
  description = "List of up to 6 IDs of teams required to review a deployment to the environment"
  type        = list(string)
  default     = []
}

variable "bff_deployer_role_arn" {
  description = "ARN of the AWS IAM role to assume for BFF deployments via GitHub OIDC. When set, exposed to the GitHub environment as vars.BFF_DEPLOYER_ROLE_ARN so the BFF deploy workflow can use OIDC instead of the static AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY secrets."
  type        = string
  default     = null
}
