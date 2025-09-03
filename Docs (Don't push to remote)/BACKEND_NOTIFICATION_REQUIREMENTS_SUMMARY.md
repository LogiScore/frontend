# Backend Notification Requirements - Quick Summary

## 🚨 **URGENT: Missing Email Notification System**

The frontend notification subscription system is fully implemented, but **email notifications are not being sent** because the backend endpoints are missing.

## 📋 **Required Endpoints (Priority Order)**

### **1. HIGH PRIORITY - Review Notification Trigger**
```
POST /api/notifications/trigger-review-notification
```
**When**: Called every time a new review is submitted
**Purpose**: Send email notifications to subscribed users
**Integration**: Add this call to the existing review submission endpoint

### **2. HIGH PRIORITY - Subscription Cleanup**
```
POST /api/notifications/cleanup-subscriptions
```
**When**: Called when user subscription is downgraded/expired
**Purpose**: Delete all notification subscriptions
**Integration**: Add this call to Stripe webhook handlers

### **3. MEDIUM PRIORITY - Notification Status**
```
GET /api/notifications/status/{user_id}
```
**Purpose**: Get user's notification subscription status

## 🔄 **Integration Points**

### **Review Submission Flow**
```python
# In existing review submission endpoint
@app.post("/api/reviews/")
async def create_review(review_data: ReviewCreate):
    # ... existing review creation logic ...
    
    # NEW: Trigger notifications
    await trigger_review_notifications(
        review_id=review.id,
        freight_forwarder_id=review.freight_forwarder_id,
        country=review.country,
        city=review.city,
        # ... other review data
    )
```

### **Subscription Downgrade Flow**
```python
# In Stripe webhook handler
@app.post("/api/webhooks/stripe")
async def stripe_webhook(event_data):
    if event_data.type == "customer.subscription.updated":
        # ... existing subscription update logic ...
        
        # NEW: Cleanup notifications if downgraded
        if subscription_tier_changed_to_free_or_basic:
            await cleanup_user_notifications(user_id)
```

## 📧 **Email Service Setup**

### **Required Environment Variables**
```bash
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@logiscore.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
```

### **Dependencies**
```bash
pip install fastapi-mail jinja2
```

## 🗄️ **Database Schema**

The `review_subscriptions` table already exists from the frontend implementation. You may need to add:

```sql
-- Add indexes for performance
CREATE INDEX idx_review_subscriptions_user_id ON review_subscriptions(user_id);
CREATE INDEX idx_review_subscriptions_forwarder ON review_subscriptions(freight_forwarder_id);
CREATE INDEX idx_review_subscriptions_location ON review_subscriptions(location_country, location_city);

-- Optional: Add notification logs table
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES review_subscriptions(id),
    review_id UUID REFERENCES reviews(id),
    email_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 **Current Status**

- ✅ **Frontend**: Fully implemented and working
- ✅ **Database**: Review subscriptions table exists
- ❌ **Backend**: Email notification endpoints missing
- ❌ **Integration**: Review submission doesn't trigger notifications
- ❌ **Cleanup**: Subscription downgrades don't remove notifications

## 📊 **Impact**

**Users can subscribe to notifications, but:**
- No emails are sent when new reviews are posted
- Subscriptions persist even after subscription downgrade
- Users expect notifications but receive none

## 🚀 **Quick Start Implementation**

1. **Set up email service** (1-2 days)
2. **Add notification trigger to review submission** (1 day)
3. **Add cleanup to subscription webhooks** (1 day)
4. **Test with existing subscriptions** (1 day)

**Total estimated time**: 4-5 days for basic functionality

## 📞 **Next Steps**

1. Review the detailed specification: `EMAIL_NOTIFICATION_ENDPOINTS_SPECIFICATION.md`
2. Set up email service configuration
3. Implement the two high-priority endpoints
4. Test with existing frontend subscription system
5. Deploy and monitor notification delivery

---

**This is blocking the notification feature from working properly. Users are subscribing but not receiving any emails.**
