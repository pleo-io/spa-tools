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
  })
}

data "archive_file" "lambda" {
  type        = "zip"
  output_path = "/tmp/${var.app_name}.${var.event_type}.zip"

  source {
    content  = local.lambda_source
    filename = "index.js"
  }

  source {
    content  = local.lambda_config
    filename = "config.json"
  }
}

resource "aws_lambda_function" "lambda" {
  provider         = aws.global
  description      = "${var.app_name} ${var.event_type} Lambda@Edge"
  filename         = data.archive_file.lambda.output_path
  function_name    = "${var.app_name}-${var.event_type}"
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  publish          = true
  role             = var.role_arn
  runtime          = "nodejs22.x"

  tags = {
    environment = lower(var.env)
  }
}
