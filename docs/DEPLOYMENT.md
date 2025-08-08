# Deployment Guide

## Overview

This guide covers deploying the Real Yield Hedera application to production environments, including smart contract deployment, frontend hosting, and infrastructure setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Infrastructure Setup](#infrastructure-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts

1. **Hedera Account**
   - Mainnet account with sufficient HBAR balance
   - Private key securely stored
   - Account ID noted for configuration

2. **Vercel Account** (for frontend)
   - Connected to GitHub repository
   - Pro plan recommended for production

3. **Domain Registration**
   - Custom domain for production
   - SSL certificate (handled by Vercel)

### Required Tools

- Node.js 18+ and npm
- Git
- Hardhat CLI
- Vercel CLI (optional)

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/real-yield-hedera.git
cd real-yield-hedera
npm install
```

### 2. Environment Configuration

Create production environment files:

#### `.env.production`

```env
# Hedera Network Configuration
HEDERA_NETWORK=mainnet
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
HEDERA_PUBLIC_KEY=YOUR_PUBLIC_KEY

# Mirror Node Configuration
MIRROR_NODE_URL=https://mainnet-public.mirrornode.hedera.com

# Smart Contract Addresses (deployed)
REAL_YIELD_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
INSURANCE_POOL_CONTRACT_ADDRESS=0xYOUR_INSURANCE_CONTRACT

# HCS Topic IDs
AUDIT_TOPIC_ID=0.0.YOUR_AUDIT_TOPIC
TRANSACTION_TOPIC_ID=0.0.YOUR_TRANSACTION_TOPIC

# Application Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Security
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com

# Database (if using)
DATABASE_URL=postgresql://user:password@host:port/database

# Third-party Services
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

#### Vercel Environment Variables

Set these in Vercel dashboard:

```bash
# Required for build
HEDERA_NETWORK=mainnet
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Runtime variables
HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY
REAL_YIELD_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
INSURANCE_POOL_CONTRACT_ADDRESS=0xYOUR_INSURANCE_CONTRACT
AUDIT_TOPIC_ID=0.0.YOUR_AUDIT_TOPIC
TRANSACTION_TOPIC_ID=0.0.YOUR_TRANSACTION_TOPIC
```

## Smart Contract Deployment

### 1. Compile Contracts

```bash
npm run compile
```

### 2. Deploy to Hedera Mainnet

```bash
# Deploy contracts
npm run deploy:mainnet

# Verify contracts (optional)
npm run verify:mainnet
```

### 3. Update Environment Variables

After deployment, update your environment files with the deployed contract addresses:

```env
REAL_YIELD_CONTRACT_ADDRESS=0x...
INSURANCE_POOL_CONTRACT_ADDRESS=0x...
```

### 4. Initialize Contracts

Run initialization script:

```bash
node scripts/initialize-contracts.js
```

**Initialize Script Example:**

```javascript
// scripts/initialize-contracts.js
const { ethers } = require('hardhat');
const hre = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log('Initializing contracts with account:', deployer.address);
  
  // Get deployed contracts
  const RealYield = await ethers.getContractAt(
    'RealYieldInvoiceFactoring',
    process.env.REAL_YIELD_CONTRACT_ADDRESS
  );
  
  const InsurancePool = await ethers.getContractAt(
    'InsurancePool',
    process.env.INSURANCE_POOL_CONTRACT_ADDRESS
  );
  
  // Set insurance pool in main contract
  const tx1 = await RealYield.setInsurancePool(
    process.env.INSURANCE_POOL_CONTRACT_ADDRESS
  );
  await tx1.wait();
  
  // Set main contract in insurance pool
  const tx2 = await InsurancePool.setFactoringContract(
    process.env.REAL_YIELD_CONTRACT_ADDRESS
  );
  await tx2.wait();
  
  console.log('Contracts initialized successfully');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

#### Automatic Deployment

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Configure build settings:
     - Framework: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

2. **Environment Variables**
   - Add all production environment variables
   - Ensure sensitive keys are properly secured

3. **Domain Configuration**
   - Add custom domain in Vercel settings
   - Configure DNS records:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     
     Type: A
     Name: @
     Value: 76.76.19.61
     ```

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: Self-Hosted

#### Using Docker

**Dockerfile:**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**Docker Compose:**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

**Deploy with Docker:**

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Infrastructure Setup

### Load Balancer Configuration

**Nginx Configuration:**

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Database Setup (Optional)

If using a database for caching or analytics:

**PostgreSQL on AWS RDS:**

1. Create RDS instance
2. Configure security groups
3. Update connection string in environment

**Redis for Caching:**

```bash
# Using Redis Cloud or AWS ElastiCache
REDIS_URL=redis://username:password@host:port
```

## Monitoring & Logging

### Application Monitoring

#### Sentry Integration

```bash
npm install @sentry/nextjs
```

**sentry.client.config.js:**

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

#### Health Check Endpoint

**pages/api/health.js:**

```javascript
export default async function handler(req, res) {
  try {
    // Check database connection
    // Check Hedera network connectivity
    // Check smart contract accessibility
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
}
```

### Infrastructure Monitoring

#### Prometheus & Grafana

**docker-compose.monitoring.yml:**

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
      
volumes:
  grafana-storage:
```

## Security Considerations

### 1. Environment Variables

- Never commit sensitive keys to repository
- Use secure secret management (AWS Secrets Manager, etc.)
- Rotate keys regularly
- Use different keys for different environments

### 2. Network Security

- Enable HTTPS only
- Implement rate limiting
- Use Web Application Firewall (WAF)
- Configure CORS properly

### 3. Smart Contract Security

- Audit contracts before mainnet deployment
- Use multi-signature wallets for admin functions
- Implement emergency pause mechanisms
- Monitor contract interactions

### 4. API Security

```javascript
// middleware/security.js
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

export const securityMiddleware = [
  helmet(),
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  })
];
```

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error:** `Module not found`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Hedera Connection Issues

**Error:** `UNAVAILABLE: Network error`

**Solution:**
- Check network configuration
- Verify account ID and private key
- Ensure sufficient HBAR balance

#### 3. Smart Contract Deployment Failures

**Error:** `Transaction failed`

**Solution:**
- Check gas limits
- Verify contract bytecode size
- Ensure proper network configuration

### Debugging Commands

```bash
# Check application logs
docker-compose logs -f app

# Check smart contract events
npm run hardhat:console

# Test API endpoints
curl -X GET https://your-domain.com/api/health

# Check Hedera network status
curl https://mainnet-public.mirrornode.hedera.com/api/v1/network/nodes
```

### Performance Optimization

#### 1. Frontend Optimization

- Enable Next.js Image Optimization
- Implement proper caching headers
- Use CDN for static assets
- Optimize bundle size

#### 2. API Optimization

- Implement response caching
- Use connection pooling
- Optimize database queries
- Implement pagination

#### 3. Hedera Optimization

- Batch transactions when possible
- Cache Mirror Node responses
- Use appropriate transaction fees
- Implement retry logic

## Rollback Procedures

### Frontend Rollback

**Vercel:**
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]
```

**Docker:**
```bash
# Rollback to previous image
docker-compose down
docker-compose up -d --scale app=0
docker tag your-app:previous your-app:latest
docker-compose up -d
```

### Smart Contract Rollback

- Deploy new contract version
- Update contract addresses in environment
- Migrate data if necessary
- Update frontend to use new contracts

## Support

For deployment support:

- **Documentation:** [Deployment Wiki](https://github.com/your-repo/wiki/deployment)
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Emergency:** emergency@realyieldhedera.com
- **Discord:** [#deployment channel](https://discord.gg/your-server)