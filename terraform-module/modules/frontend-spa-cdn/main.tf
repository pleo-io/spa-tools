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
    minimum_protocol_version = "TLSv1.2_2018"
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

# Upload a custom 404 error page so it's available for the CDN
resource "aws_s3_bucket_object" "object" {
  bucket       = var.bucket_name
  key          = local.error_page_key
  source       = local.error_page_file
  content_type = "text/html"
}