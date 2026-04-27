# Lambda@Edge lambdas used by the CloudFront distribution's default caching behaviour
# AWS requires edge lambdas to be deployed to the global region (us-east-1).

locals {
  lambda_source = file("${path.module}/../../edge-lambdas/dist/${var.event_type}/index.js")
  lambda_config = jsonencode({
    "originBucketName"         = var.bucket_name
    "originBucketRegion"       = var.bucket_region
    "previewDeploymentPostfix" = var.env == "production" ? "" : ".${var.domain_name}"
    "defaultBranchName"        = var.default_repo_branch_name
    "serveNestedIndexHtml"     = var.serve_nested_index_html
    "partners"                 = var.partners
  })
}

resource "terraform_data" "lambda_zip_dir" {
  provisioner "local-exec" {
    command = "mkdir -p ${path.root}/.lambda-zips"
  }
}

data "archive_file" "lambda" {
  depends_on  = [terraform_data.lambda_zip_dir]
  type        = "zip"
  output_path = "${path.root}/.lambda-zips/${var.app_name}.${var.event_type}.js.zip"

  source {
    content  = local.lambda_source
    filename = "index.js"
  }

  source {
    content  = local.lambda_config
    filename = "config.json"
  }
}

locals {
  function_name = "${var.app_name}-${var.event_type}"
}

resource "aws_lambda_function" "lambda" {
  provider         = aws.global
  description      = "${var.app_name} ${var.event_type} Lambda@Edge"
  filename         = data.archive_file.lambda.output_path
  function_name    = local.function_name
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  publish          = true
  role             = var.role_arn
  runtime          = "nodejs22.x"

  tags = {
    environment = lower(var.env)
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}

# CloudWatch Log Groups for Lambda@Edge
# 
# Lambda@Edge does not stream logs back to the region where the function was deployed (us-east-1).
# Instead, it creates regional log groups in the viewer's closest region. 
#
# To ensure PCI-DSS compliance (retention + tagging), we pre-provision these log groups  
# across all regions covered by our CloudFront Price Class.
locals {
  # PriceClass_100 limits traffic to North America and Europe.
  # We pre-deploy log groups in these specific AWS regions to prevent 
  # AWS from auto-creating them with "Infinite" retention.
  target_regions = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-central-1"
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(local.target_regions)

  region = each.key

  # Naming Convention: Lambda@Edge runtime expects the log group to be prefixed 
  # with the function's home region (always us-east-1 for Lambda@Edge).
  name              = "/aws/lambda/us-east-1.${local.function_name}"
  retention_in_days = module.data_aws_core.log_expiry_in_days

  provider = aws.global
}
