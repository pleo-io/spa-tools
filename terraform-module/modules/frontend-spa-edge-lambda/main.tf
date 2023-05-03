# Lambda@Edge lambdas used by the CloudFront distribution's default caching behaviour
# AWS requires edge lambdas to be deployed to the global region (us-east-1).

# Using local_sensitive_file to avoid Terraform printing the verbose content of the source file
resource "local_sensitive_file" "lambda_source" {
  content  = file("${path.module}/../../../edge-lambdas/dist/${var.event_type}/index.js")
  filename = "${path.root}/dist/${var.app_name}/${var.event_type}/index.js"
}

resource "local_file" "lambda_config" {
  content = jsonencode({
    "originBucketName"         = var.bucket_name
    "originBucketRegion"       = var.bucket_region
    "previewDeploymentPostfix" = var.env == "staging" ? ".${var.domain_name}" : ""
    "blockIframes"             = var.block_iframes == true ? "true" : "false"
    "isLocalised"              = var.is_localised == true ? "true" : "false"
    "blockRobots"              = var.env == "staging" ? "true" : "false"
    "defaultBranchName"        = var.default_repo_branch_name
  })
  filename = "${path.root}/dist/${var.app_name}/${var.event_type}/config.json"
}

data "archive_file" "lambda" {
  type        = "zip"
  depends_on  = [local_file.lambda_config]
  output_path = "${path.root}/${var.app_name}.${var.event_type}.js.zip"
  source_dir  = "${path.root}/dist/${var.app_name}/${var.event_type}"
}

resource "aws_lambda_function" "lambda" {
  provider         = aws.global
  description      = "${var.app_name} ${var.event_type} Lambda@Edge"
  filename         = "${path.root}/${var.app_name}.${var.event_type}.js.zip"
  function_name    = "${var.app_name}-${var.event_type}"
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda.output_base64sha256
  publish          = true
  role             = var.role_arn
  runtime          = "nodejs12.x"

  tags = {
    environment = lower(var.env)
  }
}

