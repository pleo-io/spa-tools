locals {
  s3_origin_id    = "${var.app_name}-s3-origin"
  error_page_key  = "html/404.html"
  error_page_file = "${path.module}/404.html"
}

# CloudFront CDN distribution for an SPA app
resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  is_ipv6_enabled     = true
  wait_for_deployment = false
  price_class         = var.cloudfront_price_class
  comment             = "${var.app_name} - ${var.domain_name}"

  aliases = lower(var.env) == "production" ? [var.domain_name] : [var.domain_name, "*.${var.domain_name}"]

  # The distribution is served by the origin S3 bucket accessible only via OAI
  origin {
    domain_name = var.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = var.cloudfront_access_identity_path
    }
  }

  # The default cache behaviour is used to serve HTML. The logic of which file from
  # the origin bucket should be served is handled by the viewer-requst edge lambda. 
  # Additionally, response headers are added via a viewer response edge lambda,
  # including the caching headers to make sure we don't serve stale HTML.
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    dynamic "lambda_function_association" {
      for_each = var.edge_lambdas
      content {
        event_type = lambda_function_association.value["event_type"]
        lambda_arn = lambda_function_association.value["arn"]
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.default_behaviour_headers_policy.id

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 1
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  # Cache behaviour applying to specific path: /loading.html
  # To allow sharing the browsing context group with the opener page
  # This is needed to set up connection with 3rd party integrations
  ordered_cache_behavior {
    path_pattern     = "/loading.html"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    dynamic "lambda_function_association" {
      for_each = var.edge_lambdas
      content {
        event_type = lambda_function_association.value["event_type"]
        lambda_arn = lambda_function_association.value["arn"]
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.loading_integration_behaviour_headers_policy.id

    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 1
    default_ttl            = 86400
    max_ttl                = 31536000
  }

  # Cache behaviour applying to all files prefixed with /static
  # To optimise latency we don't have any lambda assosiations and
  # the TTL rules allow for optimal caching
  ordered_cache_behavior {
    path_pattern     = "/static/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    min_ttl                = 1
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
  }

  # Serve a custom 404 error page when requesting a file that doesn't exist in the bucket 
  custom_error_response {
    error_caching_min_ttl = 10
    error_code            = 404
    response_code         = 404
    response_page_path    = "/${local.error_page_key}"
  }

  # Custom SSL certificate to support custom domain aliases
  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.env
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

resource "aws_cloudwatch_log_delivery_source" "this" {
  name         = "cloudfront"
  log_type     = "ACCESS_LOGS"
  resource_arn = aws_cloudfront_distribution.this.arn
}

resource "aws_cloudwatch_log_delivery_destination" "this" {
  name          = "s3"
  output_format = "parquet"

  delivery_destination_configuration {
    destination_resource_arn = module.data_aws_core.s3_bucket_log.arn
  }
}

resource "aws_cloudwatch_log_delivery" "this" {
  delivery_source_name     = aws_cloudwatch_log_delivery_source.this.name
  delivery_destination_arn = aws_cloudwatch_log_delivery_destination.this.arn

  s3_delivery_configuration {
    suffix_path = "/cloudfront/{DistributionId}/{yyyy}/{MM}/{dd}/{HH}"
  }
}

# Upload a custom 404 error page so it's available for the CDN
resource "aws_s3_bucket_object" "object" {
  bucket       = var.bucket_name
  key          = local.error_page_key
  source       = local.error_page_file
  content_type = "text/html"
}

resource "aws_cloudfront_response_headers_policy" "default_behaviour_headers_policy" {
  name = "${var.app_name}-default-headers-policy"
  security_headers_config {
    content_type_options {
      override = true
    }
    dynamic "frame_options" {
      for_each = var.block_iframes != "none" ? [1] : []
      content {
        frame_option = var.block_iframes == "all" ? "DENY" : "SAMEORIGIN"
        override     = true
      }
    }
    referrer_policy {
      referrer_policy = "same-origin"
      override        = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
    strict_transport_security {
      access_control_max_age_sec = "63072000"
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
  }

  custom_headers_config {

    // Adds cache control HTTP headers to the response to remove any caching
    // Since we're only handling skeleton HTML files in this behaviour, disabling
    // caching has little performance overhead. All static assets are cached aggressively
    // in another behaviour.
    items {
      header   = "Cache-Control"
      override = true
      value    = "max-age=0,no-cache,no-store,must-revalidate"
    }

    // Adds robots tag HTTP header to the response to prevent indexing by bots (unless in production)
    items {
      header   = "X-Robots-Tag"
      override = true
      value    = var.is_robots_indexing_allowed && var.env == "production" ? "all" : "noindex, nofollow"
    }

    // If page is opened via window.open() or by navigating to a new page
    // it will be opened in a new browsing context group
    // unless opener has the same origin as the target page.
    // This prevents sharing the browsing context group with potentially malicious opener page
    items {
      header   = "Cross-Origin-Opener-Policy"
      override = true
      value    = "same-origin-allow-popups"
    }
  }
}

// This is custom headers policy for /loading.html page
// This page is used as an intermediate page for 3rd party integration connections
// And it should have ability to share same browsing context group with the opener page
resource "aws_cloudfront_response_headers_policy" "loading_integration_behaviour_headers_policy" {
  name = "${var.app_name}-loading-integration-headers-policy"
  security_headers_config {
    content_type_options {
      override = true
    }
    dynamic "frame_options" {
      for_each = var.block_iframes != "none" ? [1] : []
      content {
        frame_option = var.block_iframes == "all" ? "DENY" : "SAMEORIGIN"
        override     = true
      }
    }
    referrer_policy {
      referrer_policy = "same-origin"
      override        = true
    }
    xss_protection {
      mode_block = true
      protection = true
      override   = true
    }
    strict_transport_security {
      access_control_max_age_sec = "63072000"
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
  }

  custom_headers_config {

    // Adds cache control HTTP headers to the response to remove any caching
    // Since we're only handling skeleton HTML files in this behaviour, disabling
    // caching has little performance overhead. All static assets are cached aggressively
    // in another behaviour.
    items {
      header   = "Cache-Control"
      override = true
      value    = "max-age=0,no-cache,no-store,must-revalidate"
    }

    // Adds robots tag HTTP header to the response to prevent indexing by bots
    items {
      header   = "X-Robots-Tag"
      override = true
      value    = "noindex, nofollow"
    }

    // using unsafe-none to explicitly allow sharing the browsing context group with the opener page
    items {
      header   = "Cross-Origin-Opener-Policy"
      override = true
      value    = "unsafe-none"
    }
  }
}
