# route53-namecheap.tf - DNS configuration for Namecheap-managed domain

# NOTE: Since your domain is managed on Namecheap, you'll need to manually
# create DNS records there. This file provides the values you need.

# Output the DNS records you need to create in Namecheap
output "namecheap_dns_instructions" {
  value = <<-EOT
    
    ==========================================
    NAMECHEAP DNS CONFIGURATION REQUIRED
    ==========================================
    
    Go to Namecheap → Domain List → mcnattcloud.com → Advanced DNS
    
    Add the following DNS records:
    
    1. CloudFront Distribution (CNAME for subdomain)
       Type: CNAME Record
       Host: nameria
       Value: ${aws_cloudfront_distribution.website.domain_name}
       TTL: Automatic
    
    2. ACM Certificate Validation Records:
       You'll need to add the validation records shown below.
       These will be displayed after you run 'terraform apply'.
    
    CloudFront Domain: ${aws_cloudfront_distribution.website.domain_name}
    
    After adding these records:
    - Wait 5-10 minutes for DNS propagation
    - Test with: dig nameria.mcnattcloud.com
    - Access your site at: https://nameria.mcnattcloud.com
    
    ==========================================
  EOT
  
  description = "Instructions for configuring DNS in Namecheap"
}

# For ACM certificate validation, we still need the validation records
# but you'll add them manually to Namecheap
output "acm_validation_records" {
  value = [
    for dvo in aws_acm_certificate.website.domain_validation_options : {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
  description = "ACM validation records to add to Namecheap DNS"
}

# Alternative: If you want to use Route 53 for DNS management
# (recommended for production), uncomment this section and update Namecheap
# nameservers to point to Route 53

# resource "aws_route53_zone" "main" {
#   name = var.domain_name
#   
#   tags = {
#     Name = "${var.project_name}-hosted-zone"
#   }
# }
# 
# output "route53_nameservers" {
#   value = aws_route53_zone.main.name_servers
#   description = "Update these nameservers in Namecheap"
# }

