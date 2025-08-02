# LogiScore Stripe Configuration Guide

## Overview
This guide covers the complete Stripe setup for LogiScore, including subscription products, webhook configuration, and payment flow integration.

## 1. Stripe Account Setup

### 1.1 Account Configuration
- **Account**: marc@mmlogistix.com
- **Mode**: Test mode (for development)
- **Currency**: USD (primary)
- **Webhook Endpoint**: https://logiscore-api.onrender.com/api/v1/webhook

## 2. Subscription Products

### 2.1 Shipper Plans

#### Free Plan
- **Product ID**: `prod_shipper_free`
- **Price ID**: `price_shipper_free`
- **Price**: $0/month
- **Features**: Basic review access, limited searches

#### Insights Plan
- **Product ID**: `prod_shipper_insights`
- **Price ID**: `price_shipper_insights`
- **Price**: $29/month
- **Features**: Advanced analytics, detailed reports, competitor benchmarking

#### Reputation+ Plan
- **Product ID**: `prod_shipper_reputation_plus`
- **Price ID**: `price_shipper_reputation_plus`
- **Price**: $99/month
- **Features**: White-labeled reports, priority support, custom analytics

### 2.2 Forwarder Plans

#### Free Plan
- **Product ID**: `prod_forwarder_free`
- **Price ID**: `price_forwarder_free`
- **Price**: $0/month
- **Features**: Basic listing, limited responses

#### Premium Plan
- **Product ID**: `prod_forwarder_premium`
- **Price ID**: `price_forwarder_premium`
- **Price**: $199/month
- **Features**: Enhanced listing, dispute management, analytics dashboard

## 3. Webhook Setup

### 3.1 Create Webhook Endpoint

#### Step 1: Access Stripe Dashboard
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Sign in with your account (marc@mmlogistix.com)
3. Make sure you're in **Test mode** (toggle in top-right)

#### Step 2: Navigate to Webhooks
1. In the left sidebar, click **Developers**
2. Click **Webhooks**
3. Click **Add endpoint**

#### Step 3: Configure Webhook
1. **Endpoint URL**: `https://logiscore-api.onrender.com/api/v1/webhook`
2. **Events to send**: Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.updated`

#### Step 4: Save and Get Secret
1. Click **Add endpoint**
2. You'll see a success message
3. **Important**: Copy the webhook signing secret (starts with `whsec_`)
4. This is your `STRIPE_WEBHOOK_SECRET`

### 3.2 Webhook Secret Location

#### In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Reveal** next to "Signing secret"
4. Copy the secret (format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

#### Alternative Method:
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Endpoints** in the left menu
4. Click **Reveal** next to "Signing secret"

### 3.3 Test Webhook Locally

#### Using Stripe CLI (Recommended)
```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:8000/api/v1/webhook
```

#### Manual Testing
1. In Stripe Dashboard, go to your webhook
2. Click **Send test webhook**
3. Select an event (e.g., `customer.subscription.created`)
4. Click **Send test webhook**
5. Check your server logs for the event

## 4. Environment Variables

### 4.1 Backend Environment (.env)
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your secret key
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook signing secret
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your publishable key

# Product IDs
STRIPE_SHIPPER_INSIGHTS_PRICE_ID=price_shipper_insights
STRIPE_SHIPPER_REPUTATION_PLUS_PRICE_ID=price_shipper_reputation_plus
STRIPE_FORWARDER_PREMIUM_PRICE_ID=price_forwarder_premium
```

### 4.2 Frontend Environment (.env.local)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=https://logiscore-api.onrender.com
```

## 5. Payment Flow Integration

### 5.1 Backend Implementation (FastAPI)

#### Create Checkout Session
```python
# payments.py
from fastapi import APIRouter, Depends, HTTPException
import stripe
from pydantic import BaseModel

router = APIRouter()

class CreateCheckoutSession(BaseModel):
    price_id: str
    plan_name: str
    user_email: str

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
            customer_email=data.user_email,
            metadata={
                'user_id': user_id,
                'plan_name': data.plan_name
            }
        )
        return {"id": checkout_session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

#### Webhook Handler
```python
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
    
    # Handle the event
    if event['type'] == 'customer.subscription.created':
        await handle_subscription_created(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        await handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        await handle_subscription_deleted(event['data']['object'])
    elif event['type'] == 'invoice.payment_succeeded':
        await handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        await handle_payment_failed(event['data']['object'])
    
    return {"status": "success"}

async def handle_subscription_created(subscription):
    """Handle new subscription creation"""
    user_id = subscription.metadata.get('user_id')
    plan_name = subscription.metadata.get('plan_name')
    
    # Update user subscription in database
    await update_user_subscription(user_id, subscription.id, plan_name)
    
    # Send welcome email
    await send_welcome_email(user_id, plan_name)

async def handle_subscription_updated(subscription):
    """Handle subscription updates"""
    user_id = subscription.metadata.get('user_id')
    plan_name = subscription.metadata.get('plan_name')
    
    # Update user subscription in database
    await update_user_subscription(user_id, subscription.id, plan_name)

async def handle_subscription_deleted(subscription):
    """Handle subscription cancellation"""
    user_id = subscription.metadata.get('user_id')
    
    # Downgrade user to free plan
    await update_user_subscription(user_id, None, 'free')
```

### 5.2 Frontend Implementation (React)

#### Stripe Integration
```typescript
// services/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export const createCheckoutSession = async (
  priceId: string, 
  planName: string,
  userEmail: string
) => {
  try {
    const response = await fetch('/api/v1/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ 
        price_id: priceId, 
        plan_name: planName,
        user_email: userEmail
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }
    
    const { id } = await response.json();
    const stripe = await stripePromise;
    
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId: id });
      if (error) {
        console.error('Stripe error:', error);
      }
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};
```

#### Subscription Component
```typescript
// components/SubscriptionCard.tsx
import React from 'react';
import { createCheckoutSession } from '../services/stripe';

interface SubscriptionCardProps {
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
    stripePriceId: string;
  };
  userEmail: string;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ 
  plan, 
  userEmail 
}) => {
  const handleSubscribe = async () => {
    try {
      await createCheckoutSession(
        plan.stripePriceId, 
        plan.name, 
        userEmail
      );
    } catch (error) {
      console.error('Subscription error:', error);
      // Handle error (show toast, etc.)
    }
  };

  return (
    <div className="subscription-card">
      <h3>{plan.name}</h3>
      <p className="price">${plan.price}/month</p>
      <ul className="features">
        {plan.features.map(feature => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <button 
        onClick={handleSubscribe}
        className="subscribe-btn"
      >
        Subscribe to {plan.name}
      </button>
    </div>
  );
};
```

## 6. Invoice Configuration

### 6.1 Stripe Invoice Branding
1. Go to **Settings** → **Billing** → **Invoice settings**
2. Upload your logo (LogiScore logo)
3. Set company information:
   - **Company name**: LogiScore
   - **Address**: Your business address
   - **Email**: billing@logiscore.net
   - **Phone**: Your business phone

### 6.2 Invoice Customization
```python
# Customize invoice appearance
stripe.Invoice.modify(
    invoice_id,
    custom_fields=[
        {'name': 'Order ID', 'value': order_id},
        {'name': 'Platform', 'value': 'LogiScore'}
    ],
    footer='Thank you for choosing LogiScore!'
)
```

## 7. Security & Fraud Prevention

### 7.1 PCI Compliance
- **Stripe handles PCI compliance** automatically
- **No card data** stored on your servers
- **Secure tokenization** for recurring payments

### 7.2 Fraud Detection
```python
# Check for suspicious activity
async def check_fraud_risk(customer_id: str):
    customer = stripe.Customer.retrieve(customer_id)
    
    # Check payment methods
    payment_methods = stripe.PaymentMethod.list(
        customer=customer_id,
        type='card'
    )
    
    # Check for multiple failed payments
    invoices = stripe.Invoice.list(customer=customer_id)
    failed_payments = [inv for inv in invoices.data if inv.status == 'open']
    
    risk_score = 0
    if len(failed_payments) > 2:
        risk_score += 0.5
    
    return {
        'risk_score': risk_score,
        'customer_id': customer_id,
        'payment_methods_count': len(payment_methods.data)
    }
```

## 8. Analytics & Monitoring

### 8.1 Stripe Analytics
- **Revenue tracking**: Monitor subscription revenue
- **Conversion rates**: Track checkout completion
- **Churn analysis**: Monitor subscription cancellations
- **Payment success rates**: Track failed payments

### 8.2 Custom Analytics
```python
# Track subscription events
async def track_subscription_event(event_type: str, user_id: str, plan_name: str):
    analytics_data = {
        'event_type': event_type,
        'user_id': user_id,
        'plan_name': plan_name,
        'timestamp': datetime.utcnow(),
        'platform': 'logiscore'
    }
    
    # Send to analytics service
    await send_to_analytics(analytics_data)
```

## 9. Testing

### 9.1 Test Cards
Use these test card numbers:
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **3D Secure**: `4000002500003155`

### 9.2 Test Webhooks
```bash
# Test webhook locally
stripe listen --forward-to localhost:8000/api/v1/webhook

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

## 10. Troubleshooting

### 10.1 Common Issues

#### Webhook Not Receiving Events
1. **Check endpoint URL**: Ensure it's accessible
2. **Verify webhook secret**: Check environment variable
3. **Test locally**: Use Stripe CLI
4. **Check logs**: Monitor server logs

#### Payment Failures
1. **Check card details**: Verify test card numbers
2. **Review error messages**: Check Stripe dashboard
3. **Test webhook handling**: Ensure proper error handling

#### Subscription Issues
1. **Verify product setup**: Check price IDs
2. **Test checkout flow**: Complete test purchase
3. **Check webhook events**: Monitor event handling

### 10.2 Support Resources
- **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: Available in dashboard
- **Community**: [stripe.com/community](https://stripe.com/community)

---

*This configuration guide should be updated as the platform evolves.* 