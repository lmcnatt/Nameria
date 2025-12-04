# Cost Estimate - Nameria D&D Species Portal

## Overview
This document provides a detailed cost analysis for the Nameria serverless application, including both prototype and production scenarios.

---

## Prototype Environment Cost Estimate

### Assumptions (Prototype)
- **Traffic**: Low traffic, testing/development use
- **Requests**: ~1,000 API requests per month
- **Users**: ~50 unique users per month
- **Data Transfer**: ~10 GB per month
- **Lambda Executions**: ~1,000 invocations per month
- **DynamoDB**: ~1,000 reads per month
- **Region**: Single region (us-east-1)

### Monthly Cost Breakdown (Prototype)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| **S3 (Standard Storage)** | 1 GB storage, 1,000 GET requests | $0.03 |
| **CloudFront** | 10 GB data transfer, 1,000 requests | $0.85 |
| **API Gateway** | 1,000 HTTP API requests | $0.00 (Free tier) |
| **Lambda** | 1,000 invocations, 256 MB, 100ms avg | $0.00 (Free tier) |
| **DynamoDB** | On-demand, 1,000 reads, 100 writes | $0.00 (Free tier) |
| **Route 53** | Hosted zone + queries | $0.50 |
| **ACM Certificate** | SSL/TLS certificate | $0.00 (Free) |
| **CloudWatch Logs** | 1 GB logs | $0.50 |
| **CodePipeline** | 1 active pipeline | $1.00 |
| **CodeBuild** | 10 builds/month, 5 min each | $0.00 (Free tier) |

**Total Monthly Cost (Prototype): ~$2.88**

**Total Yearly Cost (Prototype): ~$34.56**

---

## Production Environment Cost Estimate

### Assumptions (Production)

Based on Paradise Donut Company's 31,000 retail locations:

- **Stores**: 31,000 retail locations
- **App Usage**: 10% of customers use the digital menu per store
- **Daily Customers**: Average 500 customers per store per day
- **Digital Users**: 50 customers per store per day use the app
- **Total Daily Users**: 31,000 × 50 = 1,550,000 users/day
- **Monthly Active Users**: ~46,500,000 requests/month
- **Average Data per Request**: 100 KB (images + JSON)
- **Total Monthly Data Transfer**: ~4,650 GB (4.65 TB)
- **API Requests**: 46,500,000 per month
- **Lambda Invocations**: 93,000,000 per month (2 functions per request)
- **DynamoDB Reads**: 93,000,000 per month
- **Regions**: 10 regions (North America: 3, Europe: 3, Asia: 2, South America: 1, Australia: 1)
- **Peak Traffic**: 3x average during meal times

### Monthly Cost Breakdown (Per Region)

| Service | Usage (Per Region) | Monthly Cost |
|---------|-------------------|--------------|
| **S3 (Standard Storage)** | 5 GB storage, 4.65M GET requests | $186.50 |
| **CloudFront** | 465 GB transfer, 4.65M requests | $39.90 |
| **API Gateway** | 4.65M HTTP API requests | $4.65 |
| **Lambda** | 9.3M invocations, 256 MB, 100ms | $155.00 |
| **DynamoDB** | On-demand: 9.3M reads, 100K writes | $116.50 |
| **Route 53** | Health checks + queries | $60.00 |
| **CloudWatch Logs** | 50 GB logs | $25.00 |
| **Data Transfer** | Inter-region replication | $93.00 |

**Total Per Region: ~$680.55/month**

### Global Production Cost (10 Regions)

**Total Monthly Cost: $680.55 × 10 = $6,805.50**

**Total Yearly Cost: $6,805.50 × 12 = $81,666.00**

---

## Additional Production Considerations

### Scaling Factors
1. **DynamoDB Global Tables**: Additional ~$50/month per region for replication
2. **WAF (Web Application Firewall)**: ~$10/month + $1 per million requests
3. **Shield Standard**: Included free with CloudFront
4. **Lambda Reserved Concurrency**: ~$100/month for guaranteed capacity
5. **CloudWatch Enhanced Monitoring**: ~$50/month for detailed metrics
6. **AWS X-Ray**: ~$5/month for distributed tracing

### Optimizations for Cost Reduction

1. **CloudFront Caching**
   - Increase TTL to reduce S3 requests
   - Potential savings: ~$100/month per region

2. **DynamoDB Reserved Capacity**
   - For predictable workloads
   - Potential savings: 20-30% (~$200/month globally)

3. **S3 Intelligent-Tiering**
   - Automatic cost optimization for storage
   - Potential savings: ~10% on storage costs

4. **Lambda SnapStart**
   - Reduce cold starts, improve performance
   - Cost neutral, improves user experience

5. **API Gateway Caching**
   - Cache frequent requests
   - Potential savings: ~$50/month per region

### With Optimizations

**Optimized Monthly Cost: ~$6,000**

**Optimized Yearly Cost: ~$72,000**

---

## Cost Comparison: Traditional vs Serverless

### Traditional Architecture (10 Regions)
- **EC2 Instances**: t3.medium × 20 (2 per region, HA) = $600/month
- **RDS**: db.t3.medium × 10 (1 per region) = $1,300/month  
- **Load Balancers**: ALB × 10 = $250/month
- **Data Transfer**: Similar costs ~$930/month
- **Total Traditional**: ~$3,080/month = **$36,960/year**

### Serverless Architecture
- **Total Serverless**: ~$6,805/month = **$81,666/year**

**Analysis**: 
Traditional architecture is cheaper at this scale, BUT:
- ✅ Serverless: Pay only for what you use
- ✅ Serverless: Zero server management
- ✅ Serverless: Auto-scaling built-in
- ✅ Serverless: Better for variable traffic
- ✅ Traditional: Better for consistent high traffic
- ✅ Traditional: More cost-effective at enterprise scale

**Recommendation**: For PDC's 31,000 locations with high, consistent traffic, a hybrid approach would be optimal:
- Use serverless for development/staging
- Use containerized services (ECS/Fargate) for production
- Use CloudFront + S3 for static assets (both architectures)

---

## Monitoring and Alerts

### Cost Monitoring
- AWS Cost Explorer
- AWS Budgets with alerts at 80%, 100%, 120% of projected costs
- CloudWatch billing alarms
- Daily cost reports

### Budget Recommendations
- Prototype: $50/month budget
- Production: $8,000/month per region
- Set up alerts at $40 (prototype) and $6,400 (production per region)

---

## Summary

| Environment | Monthly Cost | Yearly Cost |
|-------------|--------------|-------------|
| **Prototype** | $2.88 | $34.56 |
| **Production (1 Region)** | $680.55 | $8,166.60 |
| **Production (10 Regions)** | $6,805.50 | $81,666.00 |
| **Production (Optimized)** | $6,000.00 | $72,000.00 |

The serverless architecture provides excellent scalability and minimal operational overhead, making it ideal for prototyping and variable workloads. For production at PDC's scale (31,000 locations), careful monitoring and optimization are essential to control costs.

---

*Note: All costs are estimates based on AWS pricing as of December 2024. Actual costs may vary based on usage patterns, regional pricing differences, and AWS pricing changes. Always monitor actual spending and adjust as needed.*

