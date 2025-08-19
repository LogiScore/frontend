# Backend Subscription System Implementation Guide

## Overview
This document outlines the complete backend implementation requirements for LogiScore's production-ready subscription system, including Stripe integration, subscription lifecycle management, and email notifications.

## 🎯 **Critical Missing Features**

### ❌ **What's Currently Broken/Missing**
- **Stripe Payment Integration**: No real payment gateway
- **Subscription Lifecycle Management**: No timers or expiration tracking
- **Email Notification System**: No purchase confirmations, expiry warnings, or expiration notices
- **Automatic Renewal**: No recurring billing cycles
- **Background Job System**: No automated subscription management

## 🚀 **Implementation Phases**

### **Phase 1: Foundation (Week 1)**
- Stripe setup and configuration
- Database schema updates
- Basic service structure

### **Phase 2: Core Services (Week 2)**
- Stripe service implementation
- Subscription management
- Webhook handling

### **Phase 3: Background Jobs (Week 3)**
- Job scheduler setup
- Subscription expiry management
- Automated processes

### **Phase 4: Email System (Week 4)**
- Email service integration
- Template creation
- Notification system

## 📦 **Dependencies & Setup**

### **1.1 Required Packages**
```bash
# Install required packages
pip install stripe python-dotenv fastapi-mail celery redis jinja2

# For development
pip install pytest pytest-asyncio httpx
```

### **1.2 Environment Variables**
```bash
# .env file
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email configuration
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@logiscore.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Redis for background jobs
REDIS_URL=redis://localhost:6379
```

## 🗄️ **Database Schema Updates**

### **2.1 New Subscription Fields**
```sql
-- Add to existing users table or create new subscriptions table
ALTER TABLE users ADD COLUMN (
    stripe_customer_id VARCHAR(255),
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,
    auto_renew_enabled BOOLEAN DEFAULT FALSE,
    payment_method_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    last_billing_date TIMESTAMP,
    next_billing_date TIMESTAMP,
    subscription_status ENUM('active', 'past_due', 'canceled', 'expired') DEFAULT 'active'
);

-- Create indexes for performance
CREATE INDEX idx_subscription_end_date ON users(subscription_end_date);
CREATE INDEX idx_subscription_status ON users(subscription_status);
CREATE INDEX idx_stripe_customer_id ON users(stripe_customer_id);
```

### **2.2 Pydantic Models**
```python
# models/subscription.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    EXPIRED = "expired"
    TRIAL = "trial"

class SubscriptionUpdate(BaseModel):
    tier: str
    duration_months: int
    is_paid: bool
    comment: Optional[str] = None
    auto_renew: bool = False
    payment_method_id: Optional[str] = None

class SubscriptionResponse(BaseModel):
    id: str
    user_id: str
    tier: str
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    auto_renew: bool
    stripe_subscription_id: Optional[str] = None
    days_remaining: Optional[int] = None

class StripeWebhookEvent(BaseModel):
    id: str
    type: str
    data: dict
    created: int
```

## 🔧 **Stripe Service Implementation**

### **3.1 Configuration**
```python
# config/stripe.py
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Stripe configuration
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

# Stripe price IDs (configure these in Stripe dashboard)
STRIPE_PRICE_IDS = {
    'free': None,
    'premium': 'price_premium_monthly',
    'enterprise': 'price_enterprise_monthly'
}
```

### **3.2 Customer Management Service**
```python
# services/stripe_service.py
import stripe
from typing import Optional, Dict, Any
from models.user import User

class StripeService:
    def __init__(self):
        self.stripe = stripe
    
    async def create_customer(self, user: User) -> str:
        """Create Stripe customer and return customer ID"""
        try:
            customer = self.stripe.Customer.create(
                email=user.email,
                name=user.full_name or user.username,
                metadata={
                    'user_id': str(user.id),
                    'user_type': user.user_type
                }
            )
            return customer.id
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe customer: {str(e)}")
    
    async def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Retrieve existing Stripe customer"""
        try:
            return self.stripe.Customer.retrieve(customer_id)
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve Stripe customer: {str(e)}")
    
    async def update_customer(self, customer_id: str, **kwargs) -> Dict[str, Any]:
        """Update Stripe customer details"""
        try:
            return self.stripe.Customer.modify(customer_id, **kwargs)
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update Stripe customer: {str(e)}")
    
    async def delete_customer(self, customer_id: str) -> bool:
        """Delete Stripe customer"""
        try:
            self.stripe.Customer.delete(customer_id)
            return True
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to delete Stripe customer: {str(e)}")
```

### **3.3 Subscription Management Service**
```python
# services/subscription_service.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import stripe
from models.user import User
from services.stripe_service import StripeService
from services.email_service import EmailService

class SubscriptionService:
    def __init__(self):
        self.stripe_service = StripeService()
        self.email_service = EmailService()
    
    async def create_subscription(
        self, 
        user_id: str, 
        plan_id: str, 
        payment_method_id: Optional[str] = None,
        trial_days: int = 0,
        is_paid: bool = True
    ) -> Dict[str, Any]:
        """Create Stripe subscription"""
        try:
            # 1. Get or create Stripe customer
            user = await self.get_user(user_id)
            customer_id = await self.get_or_create_stripe_customer(user)
            
            if is_paid and payment_method_id:
                # 2. Attach payment method
                stripe.PaymentMethod.attach(
                    payment_method_id, 
                    customer=customer_id
                )
                
                # 3. Create paid subscription
                subscription = stripe.Subscription.create(
                    customer=customer_id,
                    items=[{"price": plan_id}],
                    trial_period_days=trial_days,
                    payment_behavior='default_incomplete',
                    expand=['latest_invoice.payment_intent'],
                    metadata={'user_id': user_id}
                )
            else:
                # 4. Create free trial subscription
                subscription = stripe.Subscription.create(
                    customer=customer_id,
                    items=[{"price": plan_id}],
                    trial_period_days=trial_days,
                    metadata={'user_id': user_id}
                )
            
            # 5. Update database
            await self.update_user_subscription_db(user_id, subscription)
            
            # 6. Send confirmation email
            await self.email_service.send_subscription_confirmation(user_id, subscription)
            
            # 7. Schedule expiry warning (3 days before)
            if subscription.current_period_end:
                await self.schedule_expiry_warning(user_id, subscription.current_period_end)
            
            return subscription
            
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel Stripe subscription"""
        try:
            return stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    async def reactivate_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Reactivate canceled subscription"""
        try:
            return stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=False
            )
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to reactivate subscription: {str(e)}")
    
    async def update_subscription_plan(self, subscription_id: str, new_price_id: str) -> Dict[str, Any]:
        """Update subscription to different plan"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    'id': subscription['items']['data'][0].id,
                    'price': new_price_id,
                }],
                proration_behavior='create_prorations',
            )
            return subscription
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update subscription: {str(e)}")
```

## 🌐 **Webhook Endpoints**

### **4.1 Webhook Handler**
```python
# routes/webhooks.py
from fastapi import APIRouter, Request, HTTPException, Depends
import stripe
from config.stripe import WEBHOOK_SECRET
from services.subscription_service import SubscriptionService
from services.email_service import EmailService

router = APIRouter()
subscription_service = SubscriptionService()
email_service = EmailService()

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle different event types
    try:
        if event['type'] == 'invoice.payment_succeeded':
            await handle_payment_succeeded(event)
        elif event['type'] == 'invoice.payment_failed':
            await handle_payment_failed(event)
        elif event['type'] == 'customer.subscription.deleted':
            await handle_subscription_deleted(event)
        elif event['type'] == 'customer.subscription.updated':
            await handle_subscription_updated(event)
        elif event['type'] == 'customer.subscription.trial_will_end':
            await handle_trial_ending(event)
        
        return {"status": "success", "event_type": event['type']}
        
    except Exception as e:
        # Log error but don't fail webhook
        print(f"Error processing webhook {event['type']}: {str(e)}")
        return {"status": "error", "message": str(e)}

async def handle_payment_succeeded(event):
    """Handle successful payment"""
    invoice = event['data']['object']
    subscription_id = invoice.get('subscription')
    
    if subscription_id:
        # Update subscription status
        await subscription_service.update_payment_status(subscription_id, 'paid')
        # Send confirmation email
        await email_service.send_payment_confirmation(invoice)

async def handle_payment_failed(event):
    """Handle failed payment"""
    invoice = event['data']['object']
    subscription_id = invoice.get('subscription')
    
    if subscription_id:
        # Update subscription status
        await subscription_service.update_payment_status(subscription_id, 'failed')
        # Send failure notification
        await email_service.send_payment_failed_notification(invoice)

async def handle_subscription_deleted(event):
    """Handle subscription deletion"""
    subscription = event['data']['object']
    user_id = subscription.metadata.get('user_id')
    
    if user_id:
        # Update user subscription status
        await subscription_service.mark_subscription_expired(user_id)
        # Send expiration email
        await email_service.send_subscription_expired_notification(user_id)

async def handle_trial_ending(event):
    """Handle trial ending (3 days before)"""
    subscription = event['data']['object']
    user_id = subscription.metadata.get('user_id')
    
    if user_id:
        # Send trial ending warning
        await email_service.send_trial_ending_warning(user_id)
```

## ⏰ **Background Job System**

### **5.1 Celery Configuration**
```python
# config/celery.py
from celery import Celery
from config.settings import REDIS_URL

celery_app = Celery(
    'subscription_tasks',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=['tasks.subscription_tasks']
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
)
```

### **5.2 Subscription Tasks**
```python
# tasks/subscription_tasks.py
from celery import shared_task
from datetime import datetime, timedelta
from services.subscription_service import SubscriptionService
from services.email_service import EmailService
from database import get_db

subscription_service = SubscriptionService()
email_service = EmailService()

@shared_task
def check_subscription_expiry():
    """Daily task to check expiring subscriptions"""
    try:
        db = get_db()
        
        # Find subscriptions expiring in 3 days
        three_days_from_now = datetime.utcnow() + timedelta(days=3)
        expiring_subscriptions = db.query(User).filter(
            User.subscription_end_date <= three_days_from_now,
            User.subscription_status == 'active'
        ).all()
        
        for user in expiring_subscriptions:
            days_remaining = (user.subscription_end_date - datetime.utcnow()).days
            
            if days_remaining <= 3 and days_remaining > 0:
                # Send warning email
                send_expiry_warning.delay(str(user.id), days_remaining)
                
    except Exception as e:
        print(f"Error in check_subscription_expiry: {str(e)}")

@shared_task
def process_expired_subscriptions():
    """Daily task to process expired subscriptions"""
    try:
        db = get_db()
        
        # Find expired subscriptions
        expired_subscriptions = db.query(User).filter(
            User.subscription_end_date < datetime.utcnow(),
            User.subscription_status == 'active'
        ).all()
        
        for user in expired_subscriptions:
            # Mark as expired
            await subscription_service.mark_subscription_expired(str(user.id))
            
            # Send expiration email
            await email_service.send_subscription_expired_notification(str(user.id))
            
            # Optionally downgrade to free tier
            await subscription_service.downgrade_to_free_tier(str(user.id))
            
    except Exception as e:
        print(f"Error in process_expired_subscriptions: {str(e)}")

@shared_task
def send_expiry_warning(user_id: str, days_remaining: int):
    """Send subscription expiry warning"""
    try:
        await email_service.send_expiry_warning(user_id, days_remaining)
    except Exception as e:
        print(f"Error sending expiry warning to {user_id}: {str(e)}")

@shared_task
def send_renewal_reminder(user_id: str):
    """Send renewal reminder for expiring subscriptions"""
    try:
        await email_service.send_renewal_reminder(user_id)
    except Exception as e:
        print(f"Error sending renewal reminder to {user_id}: {str(e)}")

# Schedule tasks
@shared_task
def schedule_daily_tasks():
    """Schedule all daily subscription tasks"""
    # Check expiring subscriptions daily at 9 AM UTC
    check_subscription_expiry.apply_async(countdown=32400)  # 9 hours
    
    # Process expired subscriptions daily at 10 AM UTC
    process_expired_subscriptions.apply_async(countdown=36000)  # 10 hours
```

## 📧 **Email Service Integration**

### **6.1 Email Configuration**
```python
# config/email.py
from fastapi_mail import ConnectionConfig
import os

email_config = ConnectionConfig(
    MAIL_USERNAME=os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD=os.getenv('MAIL_PASSWORD'),
    MAIL_FROM=os.getenv('MAIL_FROM'),
    MAIL_PORT=int(os.getenv('MAIL_PORT', 587)),
    MAIL_SERVER=os.getenv('MAIL_SERVER'),
    MAIL_TLS=True,
    MAIL_SSL=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)
```

### **6.2 Email Service Implementation**
```python
# services/email_service.py
from fastapi_mail import FastMail, MessageSchema
from jinja2 import Environment, FileSystemLoader
from config.email import email_config
from typing import Dict, Any
import os

class EmailService:
    def __init__(self):
        self.mail = FastMail(email_config)
        self.template_env = Environment(
            loader=FileSystemLoader('templates/emails')
        )
    
    async def send_subscription_confirmation(self, user_id: str, subscription_data: Dict[str, Any]):
        """Send subscription confirmation email"""
        try:
            user = await self.get_user(user_id)
            
            template = self.template_env.get_template('subscription_confirmation.html')
            html_content = template.render(
                user_name=user.full_name or user.username,
                plan_name=subscription_data.get('tier', 'Premium'),
                expiry_date=subscription_data.get('end_date'),
                plan_features=self.get_plan_features(subscription_data.get('tier'))
            )
            
            message = MessageSchema(
                subject="Welcome to LogiScore Premium! 🎉",
                recipients=[user.email],
                body=html_content,
                subtype="html"
            )
            
            await self.mail.send_message(message)
            
        except Exception as e:
            print(f"Error sending subscription confirmation: {str(e)}")
    
    async def send_expiry_warning(self, user_id: str, days_remaining: int):
        """Send subscription expiry warning"""
        try:
            user = await self.get_user(user_id)
            
            template = self.template_env.get_template('expiry_warning.html')
            html_content = template.render(
                user_name=user.full_name or user.username,
                days_remaining=days_remaining,
                renewal_link=f"https://logiscore.com/renew/{user_id}"
            )
            
            message = MessageSchema(
                subject=f"⚠️ Your LogiScore subscription expires in {days_remaining} days",
                recipients=[user.email],
                body=html_content,
                subtype="html"
            )
            
            await self.mail.send_message(message)
            
        except Exception as e:
            print(f"Error sending expiry warning: {str(e)}")
    
    async def send_subscription_expired_notification(self, user_id: str):
        """Send subscription expired notification"""
        try:
            user = await self.get_user(user_id)
            
            template = self.template_env.get_template('subscription_expired.html')
            html_content = template.render(
                user_name=user.full_name or user.username,
                reactivation_link=f"https://logiscore.com/reactivate/{user_id}"
            )
            
            message = MessageSchema(
                subject="❌ Your LogiScore subscription has expired",
                recipients=[user.email],
                body=html_content,
                subtype="html"
            )
            
            await self.mail.send_message(message)
            
        except Exception as e:
            print(f"Error sending expiration notification: {str(e)}")
    
    async def send_payment_confirmation(self, invoice_data: Dict[str, Any]):
        """Send payment confirmation email"""
        try:
            user_id = invoice_data.get('metadata', {}).get('user_id')
            if user_id:
                user = await self.get_user(user_id)
                
                template = self.template_env.get_template('payment_confirmation.html')
                html_content = template.render(
                    user_name=user.full_name or user.username,
                    amount=invoice_data.get('amount_paid', 0) / 100,  # Convert from cents
                    currency=invoice_data.get('currency', 'usd').upper(),
                    invoice_url=invoice_data.get('hosted_invoice_url')
                )
                
                message = MessageSchema(
                    subject="💰 Payment Confirmed - LogiScore",
                    recipients=[user.email],
                    body=html_content,
                    subtype="html"
                )
                
                await self.mail.send_message(message)
                
        except Exception as e:
            print(f"Error sending payment confirmation: {str(e)}")
```

## 🔌 **API Endpoint Updates**

### **7.1 Enhanced Admin Subscription Endpoint**
```python
# routes/admin.py - Update existing endpoint
@router.put("/users/{user_id}/subscription")
async def update_user_subscription(
    user_id: str,
    subscription_data: SubscriptionUpdate,
    current_user: User = Depends(get_admin_user)
):
    """Update user subscription with Stripe integration"""
    
    try:
        if subscription_data.is_paid and subscription_data.payment_method_id:
            # Create actual Stripe subscription
            stripe_subscription = await subscription_service.create_subscription(
                user_id=user_id,
                plan_id=subscription_data.tier,
                payment_method_id=subscription_data.payment_method_id,
                trial_days=0
            )
        else:
            # Create free trial subscription
            trial_days = subscription_data.duration_months * 30
            stripe_subscription = await subscription_service.create_subscription(
                user_id=user_id,
                plan_id=subscription_data.tier,
                trial_days=trial_days,
                is_paid=False
            )
        
        # Update database
        await subscription_service.update_user_subscription_db(user_id, stripe_subscription)
        
        return {
            "message": "Subscription updated successfully",
            "subscription_id": stripe_subscription.id,
            "status": stripe_subscription.status
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/users/{user_id}/subscription")
async def get_user_subscription(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Get user subscription details"""
    try:
        subscription = await subscription_service.get_user_subscription(user_id)
        return subscription
    except Exception as e:
        raise HTTPException(status_code=404, detail="Subscription not found")

@router.post("/users/{user_id}/subscription/cancel")
async def cancel_user_subscription(
    user_id: str,
    current_user: User = Depends(get_admin_user)
):
    """Cancel user subscription"""
    try:
        result = await subscription_service.cancel_user_subscription(user_id)
        return {"message": "Subscription canceled successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 📋 **Implementation Checklist**

### **Phase 1: Foundation (Week 1)**
- [ ] Install Stripe Python library
- [ ] Set up environment variables
- [ ] Create Stripe configuration
- [ ] Update database schema
- [ ] Create Pydantic models
- [ ] Set up Stripe webhook endpoint

### **Phase 2: Core Services (Week 2)**
- [ ] Implement StripeService
- [ ] Implement SubscriptionService
- [ ] Create webhook handlers
- [ ] Set up webhook signature verification
- [ ] Test basic Stripe integration

### **Phase 3: Background Jobs (Week 3)**
- [ ] Set up Celery/Redis
- [ ] Implement subscription expiry checker
- [ ] Create warning email scheduler
- [ ] Set up expired subscription processor
- [ ] Test automated processes

### **Phase 4: Email System (Week 4)**
- [ ] Set up email service
- [ ] Create email templates
- [ ] Implement notification system
- [ ] Test email delivery
- [ ] End-to-end testing

## 🧪 **Testing Requirements**

### **Unit Tests**
- [ ] Stripe service tests
- [ ] Subscription service tests
- [ ] Email service tests
- [ ] Webhook handler tests

### **Integration Tests**
- [ ] Stripe API integration
- [ ] Database operations
- [ ] Email delivery
- [ ] Background job execution

### **End-to-End Tests**
- [ ] Complete subscription flow
- [ ] Payment processing
- [ ] Email notifications
- [ ] Subscription expiration

## 🔒 **Security Considerations**

### **Stripe Security**
- [ ] Webhook signature verification
- [ ] Secure API key storage
- [ ] Customer data protection
- [ ] PCI compliance

### **Data Security**
- [ ] Encrypt sensitive data
- [ ] Secure database connections
- [ ] Input validation
- [ ] SQL injection prevention

## 📊 **Monitoring & Logging**

### **Logging**
- [ ] Stripe API calls
- [ ] Webhook events
- [ ] Email delivery status
- [ ] Background job execution

### **Monitoring**
- [ ] Subscription metrics
- [ ] Payment success rates
- [ ] Email delivery rates
- [ ] System performance

## ❓ **Questions for Backend Team**

1. **Do you have a Stripe account set up?**
2. **What email service do you prefer?** (SendGrid, AWS SES, etc.)
3. **Do you want to use Celery for background jobs or another solution?**
4. **What's your preferred database migration strategy?**
5. **Do you have Redis available for background jobs?**
6. **What's your preferred logging and monitoring solution?**

## 📚 **Additional Resources**

- [Stripe Python Documentation](https://stripe.com/docs/api?lang=python)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Celery Documentation](https://docs.celeryproject.org/)
- [FastAPI Email Documentation](https://fastapi-mail.readthedocs.io/)

## 🚨 **Important Notes**

- **Test Mode**: Start with Stripe test keys before going live
- **Webhook Testing**: Use Stripe CLI for local webhook testing
- **Error Handling**: Implement comprehensive error handling for all Stripe operations
- **Rate Limiting**: Be aware of Stripe API rate limits
- **Backup Strategy**: Implement backup strategies for subscription data

This implementation will provide a robust, production-ready subscription system that handles the complete lifecycle from purchase to expiration with proper notifications and automated management.
