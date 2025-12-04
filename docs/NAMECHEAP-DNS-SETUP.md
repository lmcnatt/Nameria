# Namecheap DNS Setup Guide

Since your domain `mcnattcloud.com` is registered and managed on Namecheap, you'll need to configure DNS records manually after deploying your infrastructure.

---

## Why Manual DNS Setup?

Unlike Route 53, Namecheap doesn't have Terraform integration, so DNS records must be added manually. However, Terraform will provide you with the exact values you need.

---

## Step 1: Deploy Infrastructure First

Run Terraform to deploy all AWS resources:

```bash
cd terraform
terraform init
terraform apply
```

**Important**: The deployment will complete, but your custom domain won't work until you configure DNS in Namecheap.

---

## Step 2: Get DNS Configuration from Terraform

After deployment, Terraform will output the DNS configuration you need:

```bash
terraform output namecheap_dns_instructions
terraform output acm_validation_records
```

Save these values—you'll need them for the next steps.

---

## Step 3: Configure DNS in Namecheap

### 3.1 Log into Namecheap

1. Go to [namecheap.com](https://www.namecheap.com)
2. Sign in to your account
3. Go to **Dashboard** → **Domain List**
4. Click **Manage** next to `mcnattcloud.com`
5. Go to **Advanced DNS** tab

### 3.2 Add CloudFront CNAME Record (Main Domain)

Add a new record:

- **Type**: `CNAME Record`
- **Host**: `@`
- **Value**: `<cloudfront-distribution-id>.cloudfront.net` (from Terraform output)
- **TTL**: `Automatic`

**Example**:
```
Type: CNAME Record
Host: @
Value: d1234abcd5678.cloudfront.net
TTL: Automatic
```

### 3.3 Add WWW Subdomain Record

Add another record:

- **Type**: `CNAME Record`
- **Host**: `www`
- **Value**: `<cloudfront-distribution-id>.cloudfront.net` (same as above)
- **TTL**: `Automatic`

### 3.4 Add ACM Certificate Validation Records

For SSL/TLS to work, you need to validate your domain with AWS Certificate Manager.

Terraform output will show records like this:

```json
[
  {
    "name": "_abc123.mcnattcloud.com.",
    "type": "CNAME",
    "value": "_xyz456.acm-validations.aws."
  }
]
```

For each validation record, add to Namecheap:

- **Type**: `CNAME Record`
- **Host**: `_abc123` (remove `.mcnattcloud.com.` from the end)
- **Value**: `_xyz456.acm-validations.aws.` (include the trailing dot if shown)
- **TTL**: `Automatic`

**Important**: You may have 2 validation records (one for `mcnattcloud.com` and one for `www.mcnattcloud.com`). Add both!

---

## Step 4: Wait for DNS Propagation

- **Initial propagation**: 5-30 minutes
- **Full global propagation**: Up to 48 hours
- **Certificate validation**: 5-10 minutes after DNS propagates

### Check DNS Propagation

```bash
# Check if DNS is working
dig mcnattcloud.com

# Check from multiple locations
# Use: https://www.whatsmydns.net/
```

You should see the CloudFront domain in the CNAME record.

---

## Step 5: Verify Certificate Validation

After adding the validation records, AWS will automatically validate your certificate.

Check status:

```bash
aws acm describe-certificate --certificate-arn <your-cert-arn>
```

Or check in AWS Console:
- Go to **AWS Console** → **Certificate Manager** (us-east-1 region)
- Look for `mcnattcloud.com` certificate
- Status should change from "Pending validation" to "Issued"

This typically takes 5-10 minutes after DNS records are added.

---

## Step 6: Test Your Website

Once DNS propagates and certificate is validated:

```bash
# Test HTTPS
curl -I https://mcnattcloud.com

# Test in browser
open https://mcnattcloud.com
```

You should see:
- ✅ HTTPS working (green lock)
- ✅ Your website loads
- ✅ CloudFront headers in response

---

## Troubleshooting

### Issue: Domain doesn't resolve

**Check**:
- DNS records are added correctly in Namecheap
- No typos in CloudFront domain name
- Wait 10-15 minutes for propagation

**Test DNS**:
```bash
dig mcnattcloud.com
nslookup mcnattcloud.com
```

### Issue: Certificate validation stuck

**Check**:
- Validation CNAME records are added correctly
- Host field doesn't include the full domain (just the subdomain part)
- Wait 10 minutes after adding records

**View certificate status**:
```bash
cd terraform
terraform output acm_validation_records
```

### Issue: SSL/TLS errors

**Possible causes**:
- Certificate not yet validated
- Using HTTP instead of HTTPS
- DNS not fully propagated

**Solution**: Wait for certificate validation to complete in ACM console.

### Issue: Redirects to CloudFront domain

**Check**:
- Aliases are set correctly in CloudFront distribution
- Certificate is validated and attached
- DNS CNAME points to CloudFront domain

---

## Alternative: Use Route 53 (Recommended for Production)

For easier management and automatic DNS updates via Terraform, consider migrating DNS to Route 53:

### Migration Steps:

1. **Create Route 53 hosted zone**:
   ```bash
   # Uncomment Route 53 section in terraform/route53-namecheap.tf
   cd terraform
   terraform apply
   ```

2. **Get Route 53 nameservers**:
   ```bash
   terraform output route53_nameservers
   ```

3. **Update nameservers in Namecheap**:
   - Go to Namecheap → Domain List → Manage
   - Go to **Domain** tab
   - Set **Nameservers** to "Custom DNS"
   - Enter the 4 Route 53 nameservers

4. **Wait for propagation** (24-48 hours)

5. **Benefits**:
   - Terraform manages all DNS records
   - Automatic SSL certificate validation
   - Better integration with AWS services
   - Health checks and failover

---

## DNS Record Summary

After setup, your Namecheap DNS should have these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | d1234...cloudfront.net | Automatic |
| CNAME | www | d1234...cloudfront.net | Automatic |
| CNAME | _abc123 | _xyz...acm-validations.aws. | Automatic |
| CNAME | _def456 | _uvw...acm-validations.aws. | Automatic |

---

## Cost Considerations

- **Namecheap DNS**: Free with domain registration
- **Route 53**: $0.50/month per hosted zone + $0.40 per million queries
- **Recommendation**: Start with Namecheap (free), migrate to Route 53 for production

---

## Need Help?

- **Namecheap Support**: [support.namecheap.com](https://support.namecheap.com)
- **AWS ACM Docs**: [docs.aws.amazon.com/acm](https://docs.aws.amazon.com/acm/)
- **DNS Checker**: [whatsmydns.net](https://www.whatsmydns.net/)

---

*Last Updated: December 2024*

