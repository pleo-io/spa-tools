# S3 bucket which serves as the origin for the CDN distribution
# Stores: 
# - cursor files specifying the current active deployment for each branch
# - HTML files served by the default cache behaviour
# - static fiels served by the ordered cache behaviour
# This bucket has restricted access, and is only open for:
# - read for the CloudFront disutribution (via OAI)
# - read for the Lambda@Edge via lambda execution role
# - read and write for GitHub Actions via deployer user (not created by this module)

resource "aws_s3_bucket" "origin" {
  bucket = "${var.bucket_prefix}-${var.app_name}-origin-${lower(var.env)}"

  tags = {
    Name        = "${var.app_name} Origin Bucket ${var.env}"
    Environment = var.env
  }
}

resource "aws_s3_bucket_acl" "origin" {
  bucket = aws_s3_bucket.origin.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "origin" {
  bucket = aws_s3_bucket.origin.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# Read-write policy used by the deployer user
resource "aws_iam_policy" "read_write_origin" {
  name   = "${var.app_name}-deployer-read-write-origin"
  policy = data.aws_iam_policy_document.read_write_origin.json
}
data "aws_iam_policy_document" "read_write_origin" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:PutObjectAcl",
      "s3:ListBucket",
      "s3:GetBucketLocation",
      "s3:GetBucketWebsite",
      "s3:GetObject",
      "s3:GetObjectAcl",
      "s3:DeleteObject",
    ]

    resources = [
      "${aws_s3_bucket.origin.arn}/*",
      aws_s3_bucket.origin.arn,
    ]
  }
}


# A special CloudFront user called an origin access identity (OAI)
# used to ensure users can only access the files through CloudFront, 
# not directly from the S3 bucket
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "${var.app_name} OAI"
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.origin.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }

  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.origin.arn]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "oai_read" {
  bucket = aws_s3_bucket.origin.id
  policy = data.aws_iam_policy_document.s3_policy.json
}
