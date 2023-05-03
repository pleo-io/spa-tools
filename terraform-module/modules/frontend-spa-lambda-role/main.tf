# IAM role used as an execution role by the Lambda@Edge lambdas associated with 
# the default caching behaviour of the CloudFront distribution
resource "aws_iam_role" "lambda_edge" {
  name               = "${var.app_name}-lambda-execution-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags = {
    env = var.env
  }
}

# Lambda and Lambda@Edge service principals need to be able to assume the above role
data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
    }
  }
}

# Using the managed basic execution role to allow the lambda to upload logs to CloudWatch
resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.lambda_edge.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Allowing the execution role to read from the origin S3 bucket
# This is needed since the viewer-request lambda reads the cursor files
# to figure out which HTML file to request 

data "aws_iam_policy_document" "read_origin" {
  statement {
    actions = [
      "s3:Get*",
      "s3:List*",
      "s3-object-lambda:Get*",
      "s3-object-lambda:List*"
    ]

    resources = [
      "${var.bucket_arn}/*",
      var.bucket_arn,
    ]
  }
}
resource "aws_iam_role_policy" "read_origin" {
  role   = aws_iam_role.lambda_edge.id
  policy = data.aws_iam_policy_document.read_origin.json
}
