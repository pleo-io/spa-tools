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

  service_name = "${var.app_name}-spa-edge"

  instrumentation_config = {
    env_vars = {
      AWS_LAMBDA_EXEC_WRAPPER      = "/opt/otel-handler",
      OTEL_EXPORTER_ENDPOINT       = "https://otlp.observability.pleo.io",
      OTEL_SERVICE_NAME            = local.service_name,
      OTEL_RESOURCE_ATTRIBUTES     = "service.namespace=spa-edge,deployment.environment=${var.env},steward=${var.steward_team},cost_allocation=${var.cost_allocation_team}",
      # Sending logs through the aws_cloudwatch_log_subscription_filter
      OTEL_LOGS_EXPORTER           = "none"
      # OTEL Metrics aren't allowed right now for alloy-router
      OTEL_METRICS_EXPORTER        = "none"
      OTEL_TRACES_EXPORTER         = "otlp"
    }

    layers = [
      "arn:aws:lambda:${var.region}:184161586896:layer:opentelemetry-collector-amd64-0_12_0:1",
      "arn:aws:lambda:${var.region}:184161586896:layer:opentelemetry-nodejs-0_10_0:1"
    ]
  }
}

data "archive_file" "lambda" {
  type        = "zip"
  output_path = "/tmp/${var.app_name}.${var.event_type}.js.zip"

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

# CloudWatch Log Group for the Lambda@Edge function
# Note: Lambda@Edge logs are distributed across regions, this creates the log group in us-east-1
resource "aws_cloudwatch_log_group" "lambda_logs" {
  provider          = aws.global
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 7

  tags = {
    environment = lower(var.env)
    app_name    = var.app_name
  }
}

# CloudWatch Log Subscription Filter to forward logs to OTEL collector
resource "aws_cloudwatch_log_subscription_filter" "otel_logs" {
  count           = var.enable_log_forwarding ? 1 : 0
  provider        = aws.global
  name            = "${var.app_name}-${var.event_type}-otel-logs"
  log_group_name  = aws_cloudwatch_log_group.lambda_logs.name
  filter_pattern  = "" # Forward all logs
  destination_arn = var.otel_collector_lambda_arn

  depends_on = [aws_lambda_function.lambda]
}

# Permission for CloudWatch Logs to invoke the OTEL collector Lambda
resource "aws_lambda_permission" "cloudwatch_logs" {
  count         = var.enable_log_forwarding ? 1 : 0
  provider      = aws.global
  statement_id  = "AllowExecutionFromCloudWatchLogs-${var.app_name}-${var.event_type}"
  action        = "lambda:InvokeFunction"
  function_name = var.otel_collector_lambda_arn
  principal     = "logs.us-east-1.amazonaws.com"
  source_arn    = "${aws_cloudwatch_log_group.lambda_logs.arn}:*"
}
