# Stripe Configuration Guide

## Environment Variables

Create a `.env` file in your project root with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://logiscorebe.onrender.com

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Rxlqv2OLXWq2oiietu8CyKM

# App Configuration
VITE_APP_NAME=LogiScore
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_STRIPE_PAYMENTS=true
VITE_ENABLE_SUBSCRIPTION_MANAGEMENT=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

## Stripe Keys

### Test Mode (Development)
- **Publishable Key**: `pk_test_51Rxlqv2OLXWq2oiietu8CyKM`
- **Secret Key**: (Backend only - `sk_test_...`)

### Live Mode (Production)
- **Publishable Key**: `pk_live_...`
- **Secret Key**: (Backend only - `sk_live_...`)

## Test Card Numbers

Use these test card numbers for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Requires 3D Secure**: `4000 0084 0000 1629`

## Configuration Steps

1. **Copy the example above** to create your `.env` file
2. **Install dependencies**: `npm install @stripe/stripe-js`
3. **Test the integration** with test card numbers
4. **Switch to live keys** when deploying to production

## Security Notes

- ✅ **Frontend**: Only publishable keys
- ❌ **Frontend**: Never include secret keys
- 🔒 **Backend**: Handles all sensitive operations
- 🌐 **Webhooks**: Backend processes Stripe events
