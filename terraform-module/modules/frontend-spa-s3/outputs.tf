output "bucket_regional_domain_name" {
  value = aws_s3_bucket.origin.bucket_regional_domain_name
}

output "cloudfront_access_identity_path" {
  value = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
}

output "bucket_deployer_iam_policy" {
  value = aws_iam_policy.read_write_origin.arn
}

output "bucket_name" {
  value = aws_s3_bucket.origin.id
}

output "bucket_region" {
  value = aws_s3_bucket.origin.region
}

output "bucket_arn" {
  value = aws_s3_bucket.origin.arn
}