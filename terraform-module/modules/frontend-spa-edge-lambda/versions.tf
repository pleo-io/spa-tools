# There are two AWS providers, since we need to access two AWS regions  -
#  - all the CDN infra (lambdas, cert) lives in "us-east-1" region (this is required by AWS),
#  - the S3 bucket for origin lives in "eu-west-1" region

terraform {
  required_providers {
    aws = {
      source                = "hashicorp/aws"
      version               = ">= 3.75.2"
      configuration_aliases = [aws.global]
    }

    github = {
      source  = "integrations/github"
      version = "~> 4.0"
    }
  }
}
