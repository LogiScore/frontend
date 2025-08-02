
# LogiScore Development Guide

## Architecture Overview

### Technology Stack
- **Frontend**: React/SvelteKit → Vercel
- **Backend**: FastAPI (Python) → Render
- **Database**: Supabase (PostgreSQL)
- **Storage**: Wasabi S3 (if needed)
- **Payment**: Stripe
- **Authentication**: GitHub OAuth + JWT

## Phase 1: Foundation & MVP

### 1.1 Project Setup

#### Backend (FastAPI)
```bash
# Create backend directory
mkdir logiscore-backend
cd logiscore-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] python-multipart stripe python-dotenv

# Create requirements.txt
pip freeze > requirements.txt
```

#### Frontend (React/SvelteKit)
```bash
# For React
npx create-react-app logiscore-frontend --template typescript
cd logiscore-frontend
npm install @stripe/stripe-js axios react-router-dom @tanstack/react-query

# For SvelteKit
npm create svelte@latest logiscore-frontend
cd logiscore-frontend
npm install
npm install @stripe/stripe-js axios
```

### 1.2 Database Setup (Supabase)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get connection details from Settings → Database

#### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_KEY=[service_key]
JWT_SECRET=[your_jwt_secret]
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GITHUB_CLIENT_ID=[github_client_id]
GITHUB_CLIENT_SECRET=[github_client_secret]

# Frontend (.env.local)
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://[render-app].onrender.com
```

### 1.3 FastAPI Backend Structure

#### Main Application
```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LogiScore API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://logiscore.net", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "LogiScore API"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

#### Database Models
```python
# models.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    github_id = Column(String, unique=True)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True)
    full_name = Column(String)
    avatar_url = Column(Text)
    company_name = Column(String)
    user_type = Column(String, default="shipper")
    subscription_tier = Column(String, default="free")
    stripe_customer_id = Column(String)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FreightForwarder(Base):
    __tablename__ = "freight_forwarders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    website_url = Column(Text)
    logo_url = Column(Text)
    description = Column(Text)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

#### Authentication
```python
# auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 1.4 Frontend Structure

#### React Setup
```typescript
// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from './pages/Home';
import Forwarders from './pages/Forwarders';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/forwarders" element={<Forwarders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
```

#### SvelteKit Setup
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import '../app.css';
</script>

<main>
  <slot />
</main>

<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  
  let forwarders = [];
  
  onMount(async () => {
    const response = await fetch('/api/v1/forwarders');
    forwarders = await response.json();
  });
</script>

<h1>Welcome to LogiScore</h1>
<div class="forwarders-grid">
  {#each forwarders as forwarder}
    <div class="forwarder-card">
      <h3>{forwarder.name}</h3>
      <p>{forwarder.country}</p>
    </div>
  {/each}
</div>
```

### 1.5 Stripe Integration

#### Backend Payment Endpoints
```python
# payments.py
from fastapi import APIRouter, Depends, HTTPException
import stripe
from pydantic import BaseModel

router = APIRouter()

class CreateCheckoutSession(BaseModel):
    price_id: str
    plan_name: str

@router.post("/create-checkout-session")
async def create_checkout_session(
    data: CreateCheckoutSession,
    user_id: str = Depends(verify_token)
):
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': data.price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://logiscore.net/dashboard?success=true',
            cancel_url='https://logiscore.net/pricing?canceled=true',
            customer_email=user_email,  # Get from user_id
            metadata={
                'user_id': user_id,
                'plan_name': data.plan_name
            }
        )
        return {"id": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv("STRIPE_WEBHOOK_SECRET")
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event['type'] == 'customer.subscription.created':
        handle_subscription_created(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    
    return {"status": "success"}
```

#### Frontend Payment Integration
```typescript
// src/services/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export const createCheckoutSession = async (priceId: string, planName: string) => {
  const response = await fetch('/api/v1/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ price_id: priceId, plan_name: planName })
  });
  
  const { id } = await response.json();
  const stripe = await stripePromise;
  
  if (stripe) {
    await stripe.redirectToCheckout({ sessionId: id });
  }
};
```

### 1.6 Security & Bot Prevention

#### hCaptcha Integration
```python
# security.py
import requests
from fastapi import HTTPException

async def verify_hcaptcha(token: str, remote_ip: str):
    data = {
        'secret': os.getenv('HCAPTCHA_SECRET_KEY'),
        'response': token,
        'remoteip': remote_ip
    }
    
    response = requests.post('https://hcaptcha.com/siteverify', data=data)
    result = response.json()
    
    if not result['success']:
        raise HTTPException(status_code=400, detail="Invalid captcha")
    
    return True
```

#### Rate Limiting
```python
# middleware.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@app.exception_handler(RateLimitExceeded)
async def ratelimit_handler(request, exc):
    return _rate_limit_exceeded_handler(request, exc)

@app.post("/api/v1/reviews")
@limiter.limit("1/90days")  # One review per 90 days per user
async def submit_review(request: Request):
    # Implementation
    pass
```

## Phase 2: Enhanced Features

### 2.1 Advanced Analytics
```python
# analytics.py
from sqlalchemy import func
from datetime import datetime, timedelta

@app.get("/api/v1/analytics/overview")
async def get_analytics_overview(db: Session = Depends(get_db)):
    # Total reviews
    total_reviews = db.query(func.count(Review.id)).scalar()
    
    # Reviews this month
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    monthly_reviews = db.query(func.count(Review.id)).filter(
        Review.created_at >= month_start
    ).scalar()
    
    # Average rating
    avg_rating = db.query(func.avg(Review.overall_rating)).scalar()
    
    return {
        "total_reviews": total_reviews,
        "monthly_reviews": monthly_reviews,
        "average_rating": round(avg_rating, 2) if avg_rating else 0
    }
```

### 2.2 Email System Integration
```python
# email.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME = "system@logiscore.net",
    MAIL_PASSWORD = os.getenv("EMAIL_PASSWORD"),
    MAIL_FROM = "system@logiscore.net",
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_TLS = True,
    MAIL_SSL = False,
    USE_CREDENTIALS = True
)

fastmail = FastMail(conf)

async def send_welcome_email(email: EmailStr, username: str):
    message = MessageSchema(
        subject="Welcome to LogiScore!",
        recipients=[email],
        body=f"""
        <h1>Welcome to LogiScore, {username}!</h1>
        <p>Thank you for joining our platform.</p>
        """,
        subtype="html"
    )
    
    await fastmail.send_message(message)
```

## Phase 3: Advanced Features

### 3.1 Real-time Notifications
```python
# websockets.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

### 3.2 Advanced Search
```python
# search.py
from sqlalchemy import or_, and_
from typing import Optional

@app.get("/api/v1/search")
async def search_forwarders(
    q: Optional[str] = None,
    country: Optional[str] = None,
    rating_min: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FreightForwarder)
    
    if q:
        query = query.filter(
            or_(
                FreightForwarder.name.ilike(f"%{q}%"),
                FreightForwarder.description.ilike(f"%{q}%")
            )
        )
    
    if country:
        query = query.filter(FreightForwarder.country == country)
    
    if rating_min:
        query = query.join(Review).filter(Review.overall_rating >= rating_min)
    
    return query.all()
```

## Development Tools & Setup

### 3.3 Local Development
```bash
# Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (React)
cd frontend
npm start

# Frontend (SvelteKit)
cd frontend
npm run dev
```

### 3.4 Testing
```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "LogiScore API"}

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert "status" in response.json()
```

### 3.5 Deployment

#### Render (Backend)
```yaml
# render.yaml
services:
  - type: web
    name: logiscore-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        value: ${{supabase.DATABASE_URL}}
      - key: JWT_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        value: ${{stripe.STRIPE_SECRET_KEY}}
```

#### Vercel (Frontend)
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "react",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://logiscore-api.onrender.com/api/$1"
    }
  ]
}
```

## Metrics & Monitoring

### 3.6 Application Metrics
```python
# metrics.py
from prometheus_client import Counter, Histogram, generate_latest
from fastapi import Response

# Metrics
REVIEW_SUBMISSIONS = Counter('review_submissions_total', 'Total review submissions')
API_REQUESTS = Counter('api_requests_total', 'Total API requests', ['endpoint'])
REQUEST_DURATION = Histogram('request_duration_seconds', 'Request duration')

@app.middleware("http")
async def add_metrics(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    API_REQUESTS.labels(endpoint=request.url.path).inc()
    REQUEST_DURATION.observe(duration)
    
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### 3.7 Error Tracking
```python
# error_tracking.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment="production"
)
```

## Pre-Development Checklist

### ✅ Infrastructure Setup
- [ ] Supabase project created
- [ ] Render account configured
- [ ] Vercel account configured
- [ ] Stripe account setup
- [ ] Domain (logiscore.net) configured
- [ ] Email hosting setup

### ✅ Development Environment
- [ ] Python 3.9+ installed
- [ ] Node.js 18+ installed
- [ ] Git repository initialized
- [ ] Environment variables configured
- [ ] Local database connection tested

### ✅ Security Setup
- [ ] JWT secret generated
- [ ] GitHub OAuth app created
- [ ] hCaptcha account setup
- [ ] SSL certificates configured
- [ ] CORS settings configured

### ✅ Payment Integration
- [ ] Stripe products created
- [ ] Webhook endpoint configured
- [ ] Test payments working
- [ ] Subscription management tested

### ✅ Monitoring Setup
- [ ] Sentry project created
- [ ] Vercel Analytics enabled
- [ ] Render monitoring configured
- [ ] Error tracking tested

## Next Steps

1. **Set up local development environment**
2. **Create basic API endpoints**
3. **Implement authentication flow**
4. **Build frontend components**
5. **Test payment integration**
6. **Deploy to staging environment**
7. **Configure monitoring and analytics**
8. **Launch MVP**

---

*This development guide will be updated as the project evolves.*
