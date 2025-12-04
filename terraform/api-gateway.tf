# api-gateway.tf - API Gateway configuration (consolidated Lambda)

# HTTP API Gateway
resource "aws_apigatewayv2_api" "lambda" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
  description   = "HTTP API for ${var.project_name}"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "x-amz-date", "authorization", "x-api-key"]
    max_age       = 300
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# API Gateway Stage
resource "aws_apigatewayv2_stage" "lambda" {
  api_id      = aws_apigatewayv2_api.lambda.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn

    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = {
    Name = "${var.project_name}-api-stage"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = 7
}

# Integration: Consolidated Lambda function
resource "aws_apigatewayv2_integration" "species_api" {
  api_id           = aws_apigatewayv2_api.lambda.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.species_api.invoke_arn
  integration_method = "POST"
  payload_format_version = "2.0"
}

# Route: GET /species
resource "aws_apigatewayv2_route" "get_species" {
  api_id    = aws_apigatewayv2_api.lambda.id
  route_key = "GET /species"
  target    = "integrations/${aws_apigatewayv2_integration.species_api.id}"
}

# Route: GET /species/{id}
resource "aws_apigatewayv2_route" "get_species_by_id" {
  api_id    = aws_apigatewayv2_api.lambda.id
  route_key = "GET /species/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.species_api.id}"
}

# Optional: Custom domain for API (requires ACM certificate)
# resource "aws_apigatewayv2_domain_name" "api" {
#   domain_name = "api.${var.domain_name}"
#
#   domain_name_configuration {
#     certificate_arn = aws_acm_certificate.api.arn
#     endpoint_type   = "REGIONAL"
#     security_policy = "TLS_1_2"
#   }
# }
#
# resource "aws_apigatewayv2_api_mapping" "api" {
#   api_id      = aws_apigatewayv2_api.lambda.id
#   domain_name = aws_apigatewayv2_domain_name.api.id
#   stage       = aws_apigatewayv2_stage.lambda.id
# }
