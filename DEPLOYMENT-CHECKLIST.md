# Deployment Checklist - Nameria D&D Species Portal

Use this checklist to ensure you've completed all steps for a successful deployment.

---

## Pre-Deployment Setup

### AWS Account Setup
- [ ] AWS account created and active
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] Verify credentials (`aws sts get-caller-identity`)

### Domain Setup
- [ ] Domain `mcnattcloud.com` registered
- [ ] Route 53 hosted zone created
- [ ] Nameservers updated at domain registrar
- [ ] DNS propagation verified (`dig mcnattcloud.com`)

### Development Tools
- [ ] Terraform installed (`terraform --version` >= 1.0)
- [ ] Node.js installed (`node --version` >= 18)
- [ ] Git installed (`git --version`)
- [ ] Text editor/IDE ready (VS Code, etc.)

### GitHub Setup
- [ ] GitHub account active
- [ ] New repository created: `Nameria`
- [ ] Repository access (public or private)
- [ ] SSH key or Personal Access Token configured

---

## Project Configuration

### Update Configuration Files

#### 1. Terraform Variables
- [ ] Update `terraform/variables.tf` with your values
- [ ] Or create `terraform/terraform.tfvars`:
  ```hcl
  domain_name = "mcnattcloud.com"
  aws_region  = "us-east-1"
  ```

#### 2. CodePipeline Configuration
- [ ] Edit `terraform/codepipeline.tf`
- [ ] Update GitHub repository:
  ```hcl
  FullRepositoryId = "YOUR_USERNAME/Nameria"
  ```

#### 3. Frontend API Configuration
- [ ] Note: This will be updated AFTER first Terraform deployment
- [ ] File to update later: `frontend/js/config.js`

---

## Infrastructure Deployment

### Terraform Deployment
- [ ] Navigate to terraform directory (`cd terraform`)
- [ ] Initialize Terraform (`terraform init`)
- [ ] Validate configuration (`terraform validate`)
- [ ] Preview changes (`terraform plan`)
- [ ] Apply configuration (`terraform apply`)
  - Expected time: 10-15 minutes
- [ ] Save Terraform outputs:
  ```bash
  terraform output > ../outputs.txt
  ```

### Verify Infrastructure
- [ ] S3 bucket created (check AWS Console)
- [ ] CloudFront distribution deployed (HTTPS working)
- [ ] API Gateway endpoint created
- [ ] Lambda functions deployed
- [ ] DynamoDB table created
- [ ] Route 53 records added
- [ ] ACM certificate issued and validated

---

## Lambda Setup

### Install Dependencies
- [ ] Navigate to `lambda/getSpecies/`
- [ ] Run `npm install`
- [ ] Navigate to `lambda/getSpeciesById/`
- [ ] Run `npm install`
- [ ] Return to project root

### Update Lambda Functions
- [ ] Re-run `terraform apply` to update Lambda with dependencies
- [ ] Verify Lambda functions in AWS Console
- [ ] Check CloudWatch Logs for any errors

---

## Database Setup

### Load Sample Data
- [ ] Install project dependencies (`npm install` in root)
- [ ] Get DynamoDB table name:
  ```bash
  cd terraform
  terraform output dynamodb_table_name
  ```
- [ ] Load D&D species data:
  ```bash
  cd ..
  DYNAMODB_TABLE=<table-name> node scripts/load-data.js
  ```
- [ ] Verify data in DynamoDB Console (9 species should be loaded)

---

## Frontend Deployment

### Update API Configuration
- [ ] Get API Gateway URL:
  ```bash
  cd terraform
  terraform output api_gateway_url
  ```
- [ ] Update `frontend/js/config.js` with actual API URL
- [ ] Save changes

### Deploy Frontend
- [ ] Get S3 bucket name from Terraform output
- [ ] Sync files to S3:
  ```bash
  aws s3 sync frontend/ s3://<bucket-name> --delete
  ```
- [ ] Get CloudFront distribution ID
- [ ] Invalidate CloudFront cache:
  ```bash
  aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
  ```

---

## CI/CD Pipeline Setup

### Connect GitHub to AWS
- [ ] Go to AWS Console → CodePipeline
- [ ] Find your pipeline: `nameria-dnd-pipeline`
- [ ] Click on the Source stage
- [ ] Complete GitHub connection:
  - [ ] Click "Update pending connection"
  - [ ] Authorize GitHub
  - [ ] Select repository

### Initialize Git Repository
- [ ] Initialize git (`git init`)
- [ ] Add all files (`git add .`)
- [ ] Create initial commit (`git commit -m "Initial commit"`)
- [ ] Add remote:
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/Nameria.git
  ```
- [ ] Push to GitHub (`git push -u origin main`)

### Verify Pipeline
- [ ] Watch pipeline execution in AWS Console
- [ ] Check CodeBuild logs if issues occur
- [ ] Verify deployment completes successfully

---

## Testing

### Test API Endpoints
- [ ] Test get all species:
  ```bash
  curl https://<api-url>/species
  ```
- [ ] Test get species by ID:
  ```bash
  curl https://<api-url>/species/dragonborn
  ```
- [ ] Verify JSON response is correct
- [ ] Check for CORS headers

### Test Website
- [ ] Open CloudFront URL in browser
- [ ] Open custom domain (`https://mcnattcloud.com`)
- [ ] Verify HTTPS (green lock icon)
- [ ] Check all species cards display
- [ ] Click on species card to open modal
- [ ] Verify images/icons display
- [ ] Test on mobile device (responsive design)
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Test CI/CD Pipeline
- [ ] Make a small change (e.g., update README)
- [ ] Commit and push to GitHub
- [ ] Watch pipeline trigger automatically
- [ ] Verify changes deploy successfully
- [ ] Check website reflects changes

---

## Documentation

### Create Architecture Diagrams
- [ ] Create prototype architecture diagram
  - Use draw.io, Lucidchart, or Cloudcraft
  - Include: S3, CloudFront, API Gateway, Lambda, DynamoDB, Route 53
  - Save as `diagrams/prototype-architecture.png`

- [ ] Create production architecture diagram
  - Show multi-region deployment
  - Include: All prototype services + ElastiCache, WAF, X-Ray
  - Show 10 regions with DynamoDB Global Tables
  - Save as `diagrams/production-architecture.png`

### Review Documentation
- [ ] Read through `README.md`
- [ ] Review `docs/deployment.md`
- [ ] Check `docs/cost-estimate.md` calculations
- [ ] Verify `docs/api.md` is accurate
- [ ] Review `docs/architecture-diagrams.md`

---

## Project Submission

### Required Deliverables

#### 1. Code Repository
- [ ] GitHub repository is public or accessible to instructor
- [ ] All code committed and pushed
- [ ] README.md is complete
- [ ] .gitignore excludes sensitive files

#### 2. Infrastructure Diagrams
- [ ] Prototype architecture diagram created
- [ ] Production architecture diagram created
- [ ] Both saved in `diagrams/` folder
- [ ] Diagrams are clear and professional

#### 3. Cost Estimate
- [ ] Yearly cost estimate completed
- [ ] Traffic assumptions documented
- [ ] All AWS services included
- [ ] Saved in `docs/cost-estimate.md`

#### 4. Working Application
- [ ] Website accessible at custom domain
- [ ] API endpoints working
- [ ] Data loading from DynamoDB
- [ ] Professional appearance
- [ ] HTTPS enabled

#### 5. Optional Features
- [ ] CloudFront CDN implemented (.25 pts)
- [ ] Terraform IaC used (2 pts)
- [ ] AWS CodePipeline working (2 pts)
- [ ] Custom domain configured (.5 pts)

### Submission Document
- [ ] Fill out project submission form (provided by instructor)
- [ ] Include GitHub repository URL
- [ ] Include live website URL
- [ ] Attach or link to architecture diagrams
- [ ] Submit to Learning Management System

---

## Post-Deployment

### Monitoring Setup
- [ ] Set up CloudWatch alarms
  - Lambda errors
  - API Gateway 5XX errors
  - High latency alerts
- [ ] Configure billing alerts
- [ ] Set budget in AWS Budgets

### Backup & Recovery
- [ ] Verify DynamoDB point-in-time recovery enabled
- [ ] Confirm S3 versioning enabled
- [ ] Document recovery procedures

### Security Review
- [ ] Review IAM roles and policies
- [ ] Verify S3 buckets are not publicly accessible
- [ ] Check CloudFront access restrictions
- [ ] Ensure all data encrypted at rest

---

## Troubleshooting

### Common Issues

#### Issue: ACM Certificate Pending Validation
**Solution**: 
- [ ] Check Route 53 for validation records
- [ ] Wait 10-30 minutes for DNS propagation
- [ ] Verify hosted zone is correct

#### Issue: Lambda Function Errors
**Solution**:
- [ ] Check CloudWatch Logs
- [ ] Verify environment variables
- [ ] Check DynamoDB table name
- [ ] Ensure IAM role has correct permissions

#### Issue: API Gateway CORS Errors
**Solution**:
- [ ] Verify CORS configuration in `terraform/api-gateway.tf`
- [ ] Check allowed origins
- [ ] Test OPTIONS request

#### Issue: Website Not Loading
**Solution**:
- [ ] Check CloudFront distribution status
- [ ] Verify S3 files were uploaded
- [ ] Check Route 53 DNS records
- [ ] Test CloudFront URL directly

#### Issue: CodePipeline Fails
**Solution**:
- [ ] Check CodeBuild logs in CloudWatch
- [ ] Verify GitHub connection
- [ ] Check IAM permissions
- [ ] Review buildspec.yml

---

## Cleanup (Optional)

### When Done with Project
- [ ] Take screenshots for portfolio
- [ ] Export cost data for analysis
- [ ] Backup DynamoDB data if needed
- [ ] Run `terraform destroy` to remove all resources
- [ ] Verify all resources deleted in AWS Console
- [ ] Check for any remaining charges

---

## Project Scoring

### Self-Assessment

| Feature | Points | Complete? |
|---------|--------|-----------|
| S3 for web assets | 10 | [ ] |
| Lambda functions | 20 | [ ] |
| API Gateway | 20 | [ ] |
| DynamoDB | 20 | [ ] |
| Cost estimate | 10 | [ ] |
| Prototype diagram | 5 | [ ] |
| Production diagram | 5 | [ ] |
| Professional appearance | 3 | [ ] |
| **Subtotal (Required)** | **93** | |
| CloudFront CDN | .25 | [ ] |
| Terraform IaC | 2 | [ ] |
| AWS CodePipeline | 2 | [ ] |
| Custom domain | .5 | [ ] |
| **Total (with optional)** | **97.75** | |

**Target Score**: 97.75 / 100

---

## Additional Notes

### Contact Information
- **Student**: Logan McNatt
- **Course**: IS 531 - Fall 2025
- **Project**: AWS Serverless Project - Individual
- **Domain**: mcnattcloud.com
- **GitHub**: YOUR_USERNAME/Nameria

### Important URLs
- GitHub Repository: https://github.com/YOUR_USERNAME/Nameria
- Live Website: https://mcnattcloud.com
- CloudFront: https://DISTRIBUTION_ID.cloudfront.net
- API Gateway: https://API_ID.execute-api.us-east-1.amazonaws.com/dev

### Dates
- Project Start: [DATE]
- Infrastructure Deployed: [DATE]
- Application Deployed: [DATE]
- Submission Date: [DATE]

---

## Final Checklist

Before submission:
- [ ] Everything works end-to-end
- [ ] All documentation is complete
- [ ] Architecture diagrams are professional
- [ ] Cost estimate is thorough
- [ ] Code is committed to GitHub
- [ ] CI/CD pipeline is functional
- [ ] Website is accessible via custom domain
- [ ] API is working correctly
- [ ] Optional features are implemented
- [ ] Ready to submit!

---

**Good luck with your deployment! 🚀**

*If you encounter any issues not covered here, refer to the detailed documentation in the `docs/` folder or AWS documentation.*

