# Architecture Diagrams - Nameria D&D Species Portal

This document describes the architecture diagrams for both prototype and production environments.

---

## Prototype Architecture

### Overview
The prototype architecture demonstrates the core serverless components deployed in a single AWS region (us-east-1).

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         PROTOTYPE ARCHITECTURE                   │
│                           (us-east-1)                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────────────────────┐
│   End User   │────────▶│          Route 53 DNS                │
│   Browser    │         │      mcnattcloud.com                 │
└──────────────┘         └──────────────┬───────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │      ACM Certificate         │
                         │   (SSL/TLS - us-east-1)     │
                         └──────────────┬───────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   CloudFront Distribution    │
                         │  (CDN - Global Edge Locs)    │
                         │   - Caching (1 hour TTL)     │
                         │   - HTTPS enforcement        │
                         │   - Origin Access Control    │
                         └────────┬────────────┬────────┘
                                  │            │
                    ┌─────────────┘            └──────────────┐
                    │                                         │
                    ▼                                         ▼
         ┌──────────────────────┐              ┌─────────────────────────┐
         │   S3 Bucket          │              │   API Gateway (HTTP)    │
         │   (Static Website)   │              │   /dev/species          │
         │   - HTML/CSS/JS      │              │   - CORS enabled        │
         │   - Images           │              │   - CloudWatch logs     │
         │   - Versioning       │              └──────────┬──────────────┘
         │   - Private bucket   │                         │
         └──────────────────────┘                         │
                                                           ▼
                                              ┌──────────────────────────┐
                                              │   Lambda Functions       │
                                              │   (Node.js 18.x)         │
                                              │                          │
                                              │   1. getSpecies          │
                                              │      - List all          │
                                              │      - 256MB, 10s        │
                                              │                          │
                                              │   2. getSpeciesById      │
                                              │      - Get one by ID     │
                                              │      - 256MB, 10s        │
                                              └──────────┬───────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────────┐
                                              │   DynamoDB Table         │
                                              │   nameria-dnd-species    │
                                              │   - On-demand billing    │
                                              │   - Encryption at rest   │
                                              │   - Point-in-time recov. │
                                              │   - GSI: NameIndex       │
                                              └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────────────────────┐
│   GitHub     │────────▶│      CodePipeline                    │
│  Repository  │  Push   │  - Source: GitHub (main)             │
│   (main)     │         │  - Build: CodeBuild                  │
└──────────────┘         └──────────────┬───────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │      CodeBuild               │
                         │  - Install dependencies      │
                         │  - Package Lambda functions  │
                         │  - Deploy to Lambda          │
                         │  - Sync S3 frontend          │
                         │  - Invalidate CloudFront     │
                         └──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING & LOGGING                          │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────────────────────┐
                         │      CloudWatch              │
                         │  - Lambda logs               │
                         │  - API Gateway logs          │
                         │  - CodeBuild logs            │
                         │  - Metrics & alarms          │
                         └──────────────────────────────┘
```

### Data Flow

1. **User Request**:
   - User navigates to `https://mcnattcloud.com`
   - DNS resolves via Route 53 to CloudFront

2. **Static Assets**:
   - CloudFront serves cached content from edge locations
   - If not cached, CloudFront retrieves from S3 origin
   - HTML/CSS/JS served with HTTPS

3. **API Requests**:
   - Frontend JavaScript makes API calls to API Gateway
   - API Gateway triggers appropriate Lambda function
   - Lambda queries DynamoDB and returns data
   - Response cached by CloudFront (future enhancement)

4. **CI/CD Flow**:
   - Developer pushes code to GitHub
   - CodePipeline automatically triggers
   - CodeBuild packages and deploys changes
   - Lambda functions updated, S3 synced, CloudFront invalidated

---

## Production Architecture (Per Region)

### Overview
Production architecture expands the prototype with multi-region deployment, high availability, and additional services for enterprise scale supporting 31,000 retail locations.

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCTION ARCHITECTURE                       │
│                     (Per Region - 10 Regions)                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────────────────────────────┐
│   End User   │────────▶│     Route 53 (Global)                │
│   Browser    │         │  - Latency-based routing             │
│              │         │  - Health checks                     │
│              │         │  - Failover to nearest region        │
└──────────────┘         └──────────────┬───────────────────────┘
                                        │
                                        ▼
                         ┌──────────────────────────────┐
                         │   CloudFront (Global CDN)    │
                         │  - 200+ Edge Locations       │
                         │  - Regional Edge Caches      │
                         │  - AWS Shield Standard       │
                         │  - AWS WAF (optional)        │
                         └────────┬────────────┬────────┘
                                  │            │
                    ┌─────────────┘            └──────────────┐
                    │                                         │
                    ▼                                         ▼
         ┌──────────────────────┐              ┌─────────────────────────┐
         │   S3 Bucket          │              │   API Gateway           │
         │   (Multi-AZ)         │              │   (Regional)            │
         │   - Static assets    │              │   - Throttling (10k/s)  │
         │   - Replication      │              │   - API Keys            │
         │   - Versioning       │              │   - Usage plans         │
         │   - Lifecycle policy │              │   - Request validation  │
         └──────────────────────┘              │   - Response caching    │
                                               └──────────┬──────────────┘
                                                          │
                                                          ▼
         ┌──────────────────────────────────────────────────────────────┐
         │              Lambda Functions (Auto-scaling)                 │
         │  ┌──────────────────┐          ┌──────────────────┐         │
         │  │  getSpecies      │          │  getSpeciesById  │         │
         │  │  - Reserved      │          │  - Reserved      │         │
         │  │    concurrency   │          │    concurrency   │         │
         │  │  - 1000 max      │          │  - 1000 max      │         │
         │  │  - VPC access    │          │  - VPC access    │         │
         │  │  - X-Ray tracing │          │  - X-Ray tracing │         │
         │  └──────────────────┘          └──────────────────┘         │
         └──────────────────────┬────────────────────────────────────┘
                                │
                                ▼
                 ┌──────────────────────────────┐
                 │   ElastiCache (Redis)        │
                 │   - Query result caching     │
                 │   - TTL: 5 minutes           │
                 │   - Multi-AZ                 │
                 └──────────┬───────────────────┘
                            │
                            ▼
         ┌──────────────────────────────────────────────┐
         │         DynamoDB Global Table                │
         │    ┌─────────────────────────────────┐       │
         │    │   Region 1 (Primary)            │       │
         │    │   - Provisioned capacity        │       │
         │    │   - Auto-scaling                │       │
         │    │   - Backup enabled              │       │
         │    └────────────┬────────────────────┘       │
         │                 │                            │
         │    ┌────────────▼────────────────────┐       │
         │    │   Cross-region Replication      │       │
         │    │   (Automatic, < 1 second)       │       │
         │    └────────────┬────────────────────┘       │
         │                 │                            │
         │    ┌────────────▼────────────────────┐       │
         │    │   Region 2, 3, 4... (Replicas) │       │
         │    │   - Read replicas               │       │
         │    │   - Eventual consistency        │       │
         │    └─────────────────────────────────┘       │
         └──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                      │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────┐
         │            CloudWatch (Per Region)           │
         │  - Logs aggregation                          │
         │  - Metrics & dashboards                      │
         │  - Alarms & notifications                    │
         │  - Cross-region aggregation                  │
         └──────────────┬───────────────────────────────┘
                        │
         ┌──────────────▼───────────────────────────────┐
         │              AWS X-Ray                       │
         │  - Distributed tracing                       │
         │  - Service map                               │
         │  - Performance insights                      │
         └──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY & COMPLIANCE                         │
└─────────────────────────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────┐
         │              AWS WAF                         │
         │  - SQL injection protection                  │
         │  - XSS protection                            │
         │  - Rate limiting (per IP)                    │
         │  - Geo-blocking (if needed)                  │
         └──────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────┐
         │          AWS Shield Standard                 │
         │  - DDoS protection                           │
         │  - Always-on detection                       │
         └──────────────────────────────────────────────┘

         ┌──────────────────────────────────────────────┐
         │              AWS KMS                         │
         │  - Encryption key management                 │
         │  - DynamoDB encryption                       │
         │  - S3 encryption                             │
         └──────────────────────────────────────────────┘
```

### Regional Deployment Strategy

**Regions** (10 total):
1. **North America**: us-east-1, us-west-2, ca-central-1
2. **Europe**: eu-west-1, eu-central-1, eu-west-2
3. **Asia Pacific**: ap-southeast-1, ap-northeast-1
4. **South America**: sa-east-1
5. **Australia**: ap-southeast-2

### Traffic Distribution

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │  (Global DNS)   │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐       ┌──────────┐      ┌──────────┐
    │  Region  │       │  Region  │      │  Region  │
    │    1     │       │    2     │      │   ...    │
    │  (35%)   │       │  (25%)   │      │  (40%)   │
    └──────────┘       └──────────┘      └──────────┘
```

---

## Key Differences: Prototype vs Production

| Feature | Prototype | Production |
|---------|-----------|------------|
| **Regions** | 1 (us-east-1) | 10 (global) |
| **DynamoDB** | On-demand | Global Tables + Provisioned |
| **Lambda** | Best-effort | Reserved concurrency |
| **Caching** | CloudFront only | CloudFront + ElastiCache |
| **Monitoring** | Basic CloudWatch | X-Ray + Advanced CloudWatch |
| **Security** | Basic | WAF + Shield + KMS |
| **Cost** | ~$3/month | ~$6,800/month |
| **Availability** | ~99.5% | 99.99% |
| **Latency** | Varies | <100ms (P95) |

---

## Diagram Files

Create the following diagram files in the `diagrams/` directory:

1. **`prototype-architecture.png`**
   - Single region architecture
   - Core services only
   - Simple data flow

2. **`production-architecture.png`**
   - Multi-region setup
   - All production services
   - Complex routing and replication

### Tools for Creating Diagrams

- **draw.io** (diagrams.net) - Free, web-based
- **Lucidchart** - Professional diagramming
- **AWS Architecture Icons** - Official AWS icons
- **Cloudcraft** - 3D AWS diagrams (paid)
- **PlantUML** - Code-based diagrams

### Recommended Approach

1. Use **draw.io** with AWS Architecture Icons
2. Export as PNG (high resolution)
3. Save source files (.drawio) for future edits
4. Include in project submission

---

## Additional Production Considerations

### Disaster Recovery

```
Primary Region Failure
         │
         ▼
Route 53 Health Check Fails
         │
         ▼
Automatic Failover to Secondary Region
         │
         ▼
Traffic Routed to Healthy Region
         │
         ▼
DynamoDB Global Tables Ensure Data Consistency
```

### Auto-Scaling Strategy

- **Lambda**: Automatic (up to 1000 concurrent per function)
- **DynamoDB**: Target utilization 70%
- **API Gateway**: Throttling at 10,000 requests/second
- **ElastiCache**: Manual scaling based on metrics

---

*Note: Create actual diagram images using the descriptions above and place them in the `diagrams/` folder.*

*Last Updated: December 2024*

