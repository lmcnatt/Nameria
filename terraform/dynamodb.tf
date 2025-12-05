# dynamodb.tf - DynamoDB table configuration

resource "aws_dynamodb_table" "dnd" {
  name           = "${var.project_name}"
  billing_mode   = "PAY_PER_REQUEST" # On-demand pricing
  hash_key       = "id"

  # Primary key attribute (String type)
  attribute {
    name = "id"
    type = "S"
  }

  # Global Secondary Index attribute (String type)
  attribute {
    name = "name"
    type = "S"
  }

  # Global Secondary Index for querying by name
  global_secondary_index {
    name            = "NameIndex"
    hash_key        = "name"
    projection_type = "ALL"
  }

  # Enable point-in-time recovery
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.project_name}-table"
  }
}

# DynamoDB table for production (example with provisioned capacity)
# Uncomment for production deployment with predictable traffic
# resource "aws_dynamodb_table" "dnd_prod" {
#   name           = "${var.project_name}-prod"
#   billing_mode   = "PROVISIONED"
#   read_capacity  = 5
#   write_capacity = 5
#   hash_key       = "id"
#
#   attribute {
#     name = "id"
#     type = "S"
#   }
#
#   # Enable autoscaling for production
#   tags = {
#     Name = "${var.project_name}-table-prod"
#   }
# }
