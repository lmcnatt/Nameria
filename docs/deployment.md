# Deployment Guide - Nameria D&D Species Portal

This guide walks you through deploying the Nameria serverless application to AWS.

---

## Prerequisites

Before you begin, ensure you have:

- [x] AWS Account with appropriate permissions
- [x] AWS CLI installed and configured (`aws configure`)
- [x] Terraform installed (v1.0+)
- [x] Node.js 18+ installed
- [x] Git installed
- [x] Domain registered (mcnattcloud.com) with Route 53 hosted zone
- [x] GitHub account and repository created

---

## Step 1: Prepare Your AWS Account

### 1.1 Configure AWS CLI
```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Default region: us-east-1
# Default output format: json
```

### 1.2 Verify AWS Credentials
```bash
aws sts get-caller-identity
```

### 1.3 Set Up Route 53 Hosted Zone
If not already done:
```bash
# List existing hosted zones
aws route53 list-hosted-zones

# Create hosted zone if needed (usually done when registering domain)
# Note: Update your domain's nameservers to point to Route 53
```

---

## Step 2: Clone and Setup Repository

### 2.1 Create GitHub Repository
1. Go to GitHub and create a new repository named "Nameria"
2. Make it public or private (your choice)
3. Do NOT initialize with README (we already have one)

### 2.2 Initialize Local Repository
```bash
cd "/Users/lmcnatt/BYU/25.3 Fall/IS 531/Serverless Project/Nameria"

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Nameria D&D Species Portal"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/Nameria.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Step 3: Update Configuration Files

### 3.1 Update Terraform Variables
Edit `terraform/variables.tf` if needed, or create `terraform/terraform.tfvars`:

```hcl
aws_region  = "us-east-1"
project_name = "nameria-dnd"
environment = "dev"
domain_name = "mcnattcloud.com"
```

### 3.2 Update CodePipeline Configuration
Edit `terraform/codepipeline.tf` and update the GitHub repository:

```hcl
FullRepositoryId = "YOUR_GITHUB_USERNAME/Nameria"
BranchName       = "main"
```

---

## Step 4: Deploy Infrastructure with Terraform

### 4.1 Initialize Terraform
```bash
cd terraform
terraform init
```

### 4.2 Validate Configuration
```bash
terraform validate
```

### 4.3 Plan Deployment
```bash
terraform plan
```

Review the plan to ensure everything looks correct. You should see resources being created for:
- S3 buckets
- CloudFront distribution
- API Gateway
- Lambda functions
- DynamoDB table
- Route 53 records
- CodePipeline and CodeBuild

### 4.4 Apply Terraform Configuration
```bash
terraform apply
```

Type `yes` when prompted. This will take 10-15 minutes due to CloudFront distribution creation.

### 4.5 Note Important Outputs
```bash
terraform output
```

Save these outputs:
- `api_gateway_url`: Your API Gateway endpoint
- `cloudfront_domain_name`: CloudFront distribution
- `s3_bucket_name`: S3 bucket for frontend
- `website_url`: Your custom domain URL

---

## Step 5: Install Lambda Dependencies

### 5.1 Install Dependencies for Each Lambda Function
```bash
cd ../lambda/getSpecies
npm install

cd ../getSpeciesById
npm install

cd ../..
```

### 5.2 Re-apply Terraform (to update Lambda with dependencies)
```bash
cd terraform
terraform apply
```

---

## Step 6: Load Sample Data into DynamoDB

### 6.1 Install Script Dependencies
```bash
cd ..
npm install
```

### 6.2 Load D&D Species Data
```bash
# Get the DynamoDB table name from Terraform
TABLE_NAME=$(cd terraform && terraform output -raw dynamodb_table_name)

# Load the data
DYNAMODB_TABLE=$TABLE_NAME node scripts/load-data.js
```

You should see output confirming each species was loaded.

---

## Step 7: Update Frontend Configuration

### 7.1 Get API Gateway URL
```bash
cd terraform
API_URL=$(terraform output -raw api_gateway_url)
echo $API_URL
```

### 7.2 Update Frontend Config
Edit `frontend/js/config.js` and replace `YOUR_API_GATEWAY_URL_HERE` with your actual API Gateway URL:

```javascript
const API_CONFIG = {
  baseUrl: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev',
  // ...
};
```

### 7.3 Commit and Push Changes
```bash
cd ..
git add frontend/js/config.js
git commit -m "Update API Gateway URL"
git push
```

---

## Step 8: Deploy Frontend to S3

### 8.1 Sync Frontend Files
```bash
# Get S3 bucket name
BUCKET_NAME=$(cd terraform && terraform output -raw s3_bucket_name)

# Sync files to S3
aws s3 sync frontend/ s3://$BUCKET_NAME --delete
```

### 8.2 Invalidate CloudFront Cache
```bash
# Get CloudFront distribution ID
CF_DIST_ID=$(cd terraform && terraform output -raw cloudfront_distribution_id)

# Create invalidation
aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

---

## Step 9: Set Up AWS CodePipeline

### 9.1 Connect to GitHub
1. Go to AWS Console → Developer Tools → CodePipeline
2. Find the CodeStar Connection created by Terraform
3. Click "Update pending connection"
4. Authorize GitHub access
5. Select your repository

### 9.2 Trigger Pipeline
Once connected, the pipeline will automatically trigger on push to main branch.

You can manually trigger it:
1. Go to CodePipeline in AWS Console
2. Select "nameria-dnd-pipeline"
3. Click "Release change"

---

## Step 10: Verify Deployment

### 10.1 Test API Endpoints
```bash
# Get all species
curl https://YOUR_API_URL/species

# Get specific species
curl https://YOUR_API_URL/species/dragonborn
```

### 10.2 Test Website
Navigate to:
- CloudFront URL: `https://YOUR_CF_DOMAIN.cloudfront.net`
- Custom Domain: `https://mcnattcloud.com`

Verify:
- [x] Website loads
- [x] Species cards display
- [x] Click on a species shows detail modal
- [x] All images/styles load correctly
- [x] HTTPS is working

### 10.3 Test CI/CD Pipeline
Make a small change and push:
```bash
# Edit a file
echo "<!-- Test -->" >> frontend/index.html

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push

# Watch pipeline in AWS Console
```

---

## Step 11: DNS Propagation

After deployment, DNS changes may take 24-48 hours to fully propagate globally.

Check DNS propagation:
```bash
# Check DNS
dig mcnattcloud.com

# Check SSL certificate
curl -I https://mcnattcloud.com
```

---

## Troubleshooting

### Issue: ACM Certificate Pending Validation
**Solution**: Check Route 53 for validation records. They should be created automatically, but may take a few minutes.

```bash
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN
```

### Issue: Lambda Function Errors
**Solution**: Check CloudWatch Logs:
```bash
aws logs tail /aws/lambda/nameria-dnd-get-species --follow
```

### Issue: API Gateway Returns CORS Errors
**Solution**: Verify CORS configuration in `terraform/api-gateway.tf` and redeploy.

### Issue: S3 Access Denied
**Solution**: Verify S3 bucket policy allows CloudFront OAC access.

### Issue: CodePipeline Fails
**Solution**: 
1. Check CodeBuild logs in CloudWatch
2. Verify IAM permissions
3. Ensure buildspec.yml is correct

---

## Updating the Application

### Frontend Changes
```bash
# Make changes to frontend files
git add .
git commit -m "Update frontend"
git push
# Pipeline will automatically deploy
```

### Lambda Changes
```bash
# Make changes to Lambda functions
cd lambda/getSpecies
# Edit index.js
cd ../..

git add .
git commit -m "Update Lambda function"
git push
# Pipeline will automatically deploy
```

### Infrastructure Changes
```bash
# Make changes to Terraform files
cd terraform
terraform plan
terraform apply

cd ..
git add .
git commit -m "Update infrastructure"
git push
```

---

## Tearing Down (Cleanup)

When you want to remove all resources:

```bash
cd terraform

# Destroy all resources
terraform destroy

# Type 'yes' to confirm
```

**Note**: Some resources like S3 buckets with versioning may require manual deletion if they contain objects.

---

## Cost Monitoring

Set up billing alerts:
```bash
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

Monitor daily:
- AWS Cost Explorer
- CloudWatch metrics
- Lambda invocation counts

---

## Next Steps

- [ ] Set up custom error pages
- [ ] Add more D&D species data
- [ ] Implement search functionality
- [ ] Add filtering by traits
- [ ] Set up staging environment
- [ ] Implement automated testing
- [ ] Add monitoring dashboards
- [ ] Set up alerts for errors

---

## Support

If you encounter issues:
1. Check AWS CloudWatch Logs
2. Review Terraform state
3. Verify IAM permissions
4. Check AWS service quotas
5. Review this documentation

---

*Last Updated: December 2024*

