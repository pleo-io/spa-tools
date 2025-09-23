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
      OTEL_RESOURCE_ATTRIBUTES     = "service.namespace=spa-edge,deployment.environment=${var.env},steward=${var.steward},cost_allocation=${var.steward}",
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


resource "aws_cloudwatch_log_group" "spa_edge_lambda_log_group" {
  name              = "/aws/cloudfront/LambdaEdge/E1M4BA5P9QDIUL"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_subscription_filter" "spa_edge_cloudwatch_subscription_filter" {
  name            = "spa-edge-lambda-grafana-loki-promtail-subscription"
  log_group_name  = aws_cloudwatch_log_group.spa_edge_lambda_log_group.name
  filter_pattern  = ""
  destination_arn = data.aws_ssm_parameter.this.value

  depends_on = [
    aws_cloudwatch_log_group.spa_edge_lambda_log_group
  ]
}
