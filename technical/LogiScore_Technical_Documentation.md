# LogiScore Technical Documentation

## System Overview
- **Platform Type**: Web-based freight forwarder review aggregation platform
- **Architecture**: Microservices with API-first design
- **Database**: PostgreSQL (Supabase managed)
- **Frontend**: React/SvelteKit with modern UI/UX
- **Authentication**: JWT with GitHub OAuth integration
- **Deployment**: Vercel (Frontend) + Render (Backend)

## Technology Stack

### Backend (FastAPI on Render)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT tokens, GitHub OAuth
- **Caching**: Redis (via Supabase or Render add-on)
- **API Documentation**: Auto-generated with FastAPI
- **Deployment**: Render (Python runtime)

### Frontend (React/SvelteKit on Vercel)
- **Framework**: React or SvelteKit
- **Styling**: Tailwind CSS
- **State Management**: React Query/SWR or Svelte stores
- **Forms**: React Hook Form or Svelte forms
- **Animations**: Framer Motion or Svelte transitions
- **Deployment**: Vercel (automatic deployments)

### Infrastructure
- **Database**: Supabase (managed PostgreSQL)
- **Storage**: Wasabi S3 (if needed for file uploads)
- **Payment**: Stripe (subscriptions + invoicing)
- **Email**: Supabase Auth or custom SMTP
- **Monitoring**: Vercel Analytics + Render monitoring

### Development Tools
- **Version Control**: GitHub
- **CI/CD**: GitHub Actions
- **Testing**: pytest (backend), Jest/Vitest (frontend)
- **Code Quality**: Black, isort, ESLint, Prettier
- **Type Safety**: Python type hints, TypeScript

## Database Schema

### Core Tables (Supabase)

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company_name VARCHAR(255),
    user_type VARCHAR(20) CHECK (user_type IN ('shipper', 'forwarder', 'admin')),
    subscription_tier VARCHAR(20) DEFAULT 'free',
    stripe_customer_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Freight Forwarders Table
```sql
CREATE TABLE freight_forwarders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    website_url TEXT,
    logo_url TEXT,
    description TEXT,
    founded_year INTEGER,
    employee_count VARCHAR(50),
    revenue_range VARCHAR(100),
    services_offered TEXT[],
    certifications TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Branches Table
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website_url TEXT,
    is_headquarters BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_text TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'disputed', 'removed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Review Category Scores Table
```sql
CREATE TABLE review_category_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 4),
    weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Disputes Table
```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    dispute_reason VARCHAR(100) NOT NULL,
    dispute_details TEXT,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Ad Campaigns Table
```sql
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    freight_forwarder_id UUID REFERENCES freight_forwarders(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255) NOT NULL,
    campaign_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Relationships
- Users can submit multiple reviews
- Reviews can be associated with specific branches
- Disputes are linked to specific reviews
- Ad campaigns are linked to freight forwarders

### Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_reviews_forwarder_id ON reviews(freight_forwarder_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_branches_forwarder_id ON branches(freight_forwarder_id);
CREATE INDEX idx_disputes_review_id ON disputes(review_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github_id ON users(github_id);
```

## API Endpoints (FastAPI)

### Public Endpoints
```
GET /api/v1/forwarders - List freight forwarders
GET /api/v1/forwarders/{id} - Get forwarder details
GET /api/v1/forwarders/{id}/reviews - Get forwarder reviews
GET /api/v1/forwarders/{id}/branches - Get forwarder branches
GET /api/v1/reviews/{id} - Get review details
GET /api/v1/stats/overview - Platform statistics
```

### Authenticated Endpoints
```
POST /api/v1/reviews - Submit new review
PUT /api/v1/reviews/{id} - Update review
DELETE /api/v1/reviews/{id} - Delete review
POST /api/v1/disputes - Submit dispute
GET /api/v1/user/profile - Get user profile
PUT /api/v1/user/profile - Update user profile
GET /api/v1/user/reviews - Get user's reviews
POST /api/v1/subscriptions - Create subscription
GET /api/v1/subscriptions - Get user subscriptions
```

### Admin Endpoints
```
GET /api/v1/admin/disputes - List all disputes
PUT /api/v1/admin/disputes/{id} - Resolve dispute
DELETE /api/v1/admin/users/{id} - Ban user
PUT /api/v1/admin/forwarders/{id}/verify - Verify forwarder
GET /api/v1/admin/stats - Admin statistics
POST /api/v1/admin/bulk-import - Import forwarder data
```

## Security & Privacy

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **GitHub OAuth**: Social login integration
- **Email Verification**: Required for account activation
- **IP Tracking**: Anonymous user identification
- **Rate Limiting**: API request throttling

### Data Protection
- **Row-Level Security**: Supabase RLS policies
- **Encryption**: Data encrypted at rest and in transit
- **GDPR Compliance**: Data portability and deletion
- **PCI Compliance**: Stripe handles payment data
- **CORS Configuration**: Secure cross-origin requests

### Rate Limiting
```python
# FastAPI rate limiting example
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request, exc):
    return _rate_limit_exceeded_handler(request, exc)

@app.get("/api/v1/reviews")
@limiter.limit("10/minute")
async def get_reviews(request: Request):
    # Implementation
    pass
```

## UI/UX Components

### Design System
- **Logo**: `ui/LogiScore_Logo.png`
- **Mockups**: `ui/LogiScore_UI_*.png`
- **Color Palette**: Professional blues and grays
- **Typography**: Clean, readable fonts
- **Responsive Design**: Mobile-first approach

### Key Components
- **Review Forms**: Multi-step, category-based scoring
- **Search & Filter**: Advanced forwarder discovery
- **Dashboard**: User analytics and management
- **Admin Panel**: Moderation and dispute resolution
- **Subscription Management**: Plan upgrades/downgrades

## Deployment Strategy

### MVP Phase (Current)
- **Frontend**: Vercel (React/SvelteKit)
- **Backend**: Render (FastAPI)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Wasabi S3 (if needed)
- **Payment**: Stripe
- **Domain**: logiscore.net

### Production Scaling
- **CDN**: Vercel Edge Network
- **Caching**: Redis on Render
- **Monitoring**: Vercel Analytics + Render monitoring
- **Backup**: Supabase automated backups
- **SSL**: Automatic via Vercel/Render

## Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Vercel Analytics
- **Uptime**: Render monitoring
- **Logs**: Centralized logging

### Business Analytics
- **User Engagement**: Review submission rates
- **Revenue Tracking**: Stripe analytics
- **Platform Growth**: Forwarder and review metrics
- **Dispute Resolution**: Moderation efficiency

## Development Workflow

### Local Development
```bash
# Backend (FastAPI)
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (React/SvelteKit)
cd frontend
npm install
npm run dev
```

### Testing Strategy
- **Unit Tests**: pytest (backend), Jest/Vitest (frontend)
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright or Cypress
- **Performance Tests**: Load testing with k6

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        # Render deployment steps
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        # Vercel deployment steps
```

## Dispute Management System

### Platform Requirements
- **Anonymous User Tracking**: IP address, browser fingerprint
- **Registered User Management**: GitHub OAuth integration
- **Review History**: Complete user activity tracking
- **Admin Moderation**: Comprehensive dispute resolution tools

### User Identification Methods
```sql
-- User sessions table for tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    user_agent TEXT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Admin Moderation Tools
- **Dispute Dashboard**: Review and resolve disputes
- **User Management**: Ban users, review history
- **Analytics**: Identify patterns and abuse
- **Automated Alerts**: Suspicious activity detection

### Dispute Workflow
1. **Report Submission**: User reports inappropriate review
2. **Admin Notification**: Email to disputes@logiscore.com
3. **Review Process**: Admin investigates with full context
4. **Resolution**: Ban user, remove review, or dismiss dispute
5. **Communication**: Notify relevant parties

### Admin Dashboard Features
- **Dispute Queue**: Prioritized by urgency
- **User Profiles**: Complete activity history
- **Review Context**: Related reviews and patterns
- **Bulk Actions**: Efficient moderation tools

### Response Time SLAs
- **Critical Disputes**: 4 hours
- **Standard Disputes**: 24 hours
- **Appeals**: 48 hours
- **User Bans**: Immediate with review

## Email Infrastructure

### Domain Configuration
- **Primary Domain**: logiscore.net
- **Email Hosting**: Google Workspace or custom SMTP
- **DNS Records**: MX, SPF, DKIM, DMARC

### Primary Business Emails
- **General**: info@logiscore.net
- **Support**: support@logiscore.net
- **Sales**: sales@logiscore.net
- **Partnerships**: partnerships@logiscore.net

### Technical Emails
- **System**: system@logiscore.net
- **Security**: security@logiscore.net
- **Disputes**: disputes@logiscore.net
- **Admin**: admin@logiscore.net

### Marketing & Sales Emails
- **Newsletter**: newsletter@logiscore.net
- **Marketing**: marketing@logiscore.net
- **Press**: press@logiscore.net

### Email Hosting Setup
```python
# FastAPI email configuration
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME = "system@logiscore.net",
    MAIL_PASSWORD = "your_password",
    MAIL_FROM = "system@logiscore.net",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True
)
```

### DNS Configuration
```
# MX Records
logiscore.net.    IN  MX  10 mail.logiscore.net.

# SPF Record
logiscore.net.    IN  TXT  "v=spf1 include:_spf.google.com ~all"

# DKIM Record
google._domainkey.logiscore.net.  IN  TXT  "v=DKIM1; k=rsa; p=..."

# DMARC Record
_dmarc.logiscore.net.  IN  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@logiscore.net"
``` 