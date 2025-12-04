# Quick Start Guide - Nameria

Get your Nameria D&D Species Portal up and running in ~40 minutes (includes Namecheap DNS setup).

---

## Prerequisites

✅ AWS Account  
✅ AWS CLI configured  
✅ Terraform installed  
✅ Node.js 18+  
✅ **pnpm** installed (`npm install -g pnpm`)  
✅ Domain on Namecheap (mcnattcloud.com)  
✅ GitHub account

---

## 6-Step Deployment

### 1️⃣ Install pnpm & Dependencies (2 min)

```bash
# Install pnpm globally
npm install -g pnpm

# Install project dependencies
pnpm install
```

**Note**: No CSS build step needed - we're using Bootstrap CDN!

### 2️⃣ Update Configuration (2 min)

```bash
# Edit terraform/terraform.tfvars
cat > terraform/terraform.tfvars << EOF
domain_name = "mcnattcloud.com"
aws_region  = "us-east-1"
EOF

# Edit terraform/codepipeline.tf
# Update line 165: FullRepositoryId = "YOUR_USERNAME/Nameria"
```

### 3️⃣ Deploy Infrastructure (15 min)

```bash
cd terraform
terraform init
terraform apply  # Type 'yes'

# Save important outputs
terraform output > ../outputs.txt
terraform output namecheap_dns_instructions
terraform output acm_validation_records
cd ..
```

☕ **Wait**: CloudFront takes 10-15 minutes

### 4️⃣ Configure Namecheap DNS (5 min)

**IMPORTANT**: Your domain won't work until you configure DNS!

1. Go to [namecheap.com](https://namecheap.com) → Dashboard → Domain List
2. Click **Manage** next to `mcnattcloud.com`
3. Go to **Advanced DNS** tab
4. Add these records from Terraform output:

```bash
# Get CloudFront domain
cd terraform
CLOUDFRONT_DOMAIN=$(terraform output -raw cloudfront_domain_name)
echo "Add CNAME: @ → $CLOUDFRONT_DOMAIN"
echo "Add CNAME: www → $CLOUDFRONT_DOMAIN"

# Get ACM validation records
terraform output acm_validation_records
# Add these CNAME records too for SSL
```

**Detailed instructions**: See `docs/NAMECHEAP-DNS-SETUP.md`

### 5️⃣ Setup Lambda & Data (5 min)

```bash
# Install Lambda dependencies
cd lambda && pnpm install && cd ..

# Update Lambda function
cd terraform && terraform apply && cd ..

# Load D&D species data
DYNAMODB_TABLE=$(cd terraform && terraform output -raw dynamodb_table_name)
DYNAMODB_TABLE=$DYNAMODB_TABLE node scripts/load-data.js
```

### 6️⃣ Deploy Frontend & Setup CI/CD (8 min)

```bash
# Get API URL and update config
API_URL=$(cd terraform && terraform output -raw api_gateway_url)
echo "Update frontend/js/config.js with: $API_URL"

# Edit frontend/js/config.js and replace YOUR_API_GATEWAY_URL_HERE

# Deploy frontend
S3_BUCKET=$(cd terraform && terraform output -raw s3_bucket_name)
aws s3 sync frontend/ s3://$S3_BUCKET --delete

# Invalidate CloudFront cache
CF_DIST=$(cd terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $CF_DIST --paths "/*"

# Setup GitHub
git init
git add .
git commit -m "Initial commit: Nameria with pnpm and Bootstrap"
git remote add origin https://github.com/YOUR_USERNAME/Nameria.git
git push -u origin main

# Connect GitHub in AWS Console:
# AWS Console → CodePipeline → nameria-dnd-pipeline
# → Update pending connection → Authorize GitHub
```

---

## Test It!

```bash
# Test API
curl $(cd terraform && terraform output -raw api_gateway_url)/species

# Wait 10-15 minutes for DNS propagation, then:
echo "https://mcnattcloud.com"
```

**Note**: If domain doesn't work immediately, DNS propagation can take 10-30 minutes (sometimes up to 24 hours).

---

## Key Features

### ✨ Using pnpm
- Faster installations
- Better disk efficiency
- Use `pnpm install` instead of `npm install`
- See `docs/PNPM-SETUP.md` for details

### 🎨 Using Bootstrap 5
- Modern responsive framework via CDN
- No build step required!
- Custom D&D theme in `frontend/css/custom.css`
- Bootstrap Icons included

### 🌐 Using Namecheap DNS
- Manual DNS configuration required
- No Route 53 hosted zone
- Follow Terraform output instructions
- See `docs/NAMECHEAP-DNS-SETUP.md` for detailed guide

---

## Troubleshooting

### DNS Not Working
- Wait 10-30 minutes for propagation
- Verify CNAME records in Namecheap
- Test: `dig mcnattcloud.com`

### Certificate Not Validating
- Verify ACM validation CNAME records in Namecheap
- Wait 10 minutes after adding records
- Check AWS Certificate Manager console

### Styling Issues
- Bootstrap is loaded from CDN (check internet connection)
- Custom CSS is in `frontend/css/custom.css`
- No build step needed!

---

## Next Steps

- [ ] Wait for DNS propagation (10-30 min)
- [ ] Wait for ACM certificate validation (5-10 min after DNS)
- [ ] Test website at https://mcnattcloud.com
- [ ] Create architecture diagrams
- [ ] Review cost estimate
- [ ] Submit project

---

## Documentation

- 📘 **Namecheap Setup**: `docs/NAMECHEAP-DNS-SETUP.md`
- 📦 **pnpm Guide**: `docs/PNPM-SETUP.md`
- 📋 **Full Checklist**: `DEPLOYMENT-CHECKLIST.md`
- 🏗️ **Architecture**: `docs/architecture-diagrams.md`
- 💰 **Costs**: `docs/cost-estimate.md`

---

**You're done! 🎉**

Website: https://mcnattcloud.com (after DNS propagates)
