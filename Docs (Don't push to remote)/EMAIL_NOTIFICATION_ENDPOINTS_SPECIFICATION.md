# Email Notification System - Backend Endpoints Specification

## Overview
This document specifies the backend endpoints and functionality required to implement email notifications for LogiScore's review subscription system.

## 🎯 **Required Endpoints**

### **1. Review Notification Trigger Endpoint**

**Endpoint**: `POST /api/notifications/trigger-review-notification`

**Purpose**: Triggered whenever a new review is submitted to send notifications to subscribed users.

**Request Body**:
```json
{
  "review_id": "string",
  "freight_forwarder_id": "string",
  "freight_forwarder_name": "string",
  "country": "string",
  "city": "string",
  "reviewer_name": "string",
  "rating": "number",
  "review_text": "string",
  "created_at": "datetime"
}
```

**Response**:
```json
{
  "message": "Notifications sent successfully",
  "notifications_sent": "number",
  "subscriptions_matched": "array of subscription IDs"
}
```

**Logic**:
1. Find all active subscriptions that match:
   - Company-specific: `freight_forwarder_id` matches
   - Country-specific: `location_country` matches (no `location_city`)
   - City-specific: `location_country` AND `location_city` match
2. Send email notifications to all matching subscribers
3. Log notification activity

### **2. Subscription Cleanup Endpoint**

**Endpoint**: `POST /api/notifications/cleanup-subscriptions`

**Purpose**: Remove all notification subscriptions when a user's subscription is downgraded.

**Request Body**:
```json
{
  "user_id": "string",
  "old_subscription_tier": "string",
  "new_subscription_tier": "string",
  "cleanup_reason": "downgrade|expiry|cancellation"
}
```

**Response**:
```json
{
  "message": "Subscriptions cleaned up successfully",
  "deleted_subscriptions": "number",
  "deleted_subscription_ids": "array of strings"
}
```

**Logic**:
1. Find all review subscriptions for the user
2. Delete all notification subscriptions
3. Log cleanup activity
4. Optionally send confirmation email

### **3. Notification Status Endpoint**

**Endpoint**: `GET /api/notifications/status/{user_id}`

**Purpose**: Get notification delivery status for a user.

**Response**:
```json
{
  "user_id": "string",
  "total_subscriptions": "number",
  "active_subscriptions": "number",
  "last_notification_sent": "datetime",
  "notifications_sent_today": "number",
  "subscription_types": {
    "company": "number",
    "country": "number", 
    "city": "number"
  }
}
```

## 📧 **Email Notification Requirements**

### **Email Templates Needed**

1. **New Review Notification**
   - Subject: `New review for {company_name} in {location}`
   - Content: Review details, rating, reviewer name
   - Unsubscribe link

2. **Subscription Confirmation**
   - Subject: `You're now subscribed to {subscription_type} notifications`
   - Content: What you'll receive notifications for

3. **Subscription Cleanup Notice**
   - Subject: `Your notification subscriptions have been removed`
   - Content: Explanation of why (subscription downgrade/expiry)

### **Email Service Configuration**

```python
# Required environment variables
MAIL_USERNAME=your_email@domain.com
MAIL_PASSWORD=your_password
MAIL_FROM=noreply@logiscore.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_TLS=True
```

## 🔄 **Integration Points**

### **Review Submission Flow**
1. User submits review via `POST /api/reviews/`
2. Review is saved to database
3. **NEW**: Call `POST /api/notifications/trigger-review-notification` with review data
4. Notification system finds matching subscriptions
5. Email notifications are sent

### **Subscription Management Flow**
1. User downgrades subscription via Stripe webhook
2. User subscription tier is updated in database
3. **NEW**: Call `POST /api/notifications/cleanup-subscriptions` with user data
4. All notification subscriptions are deleted
5. Confirmation email is sent

## 🗄️ **Database Schema Updates**

### **Review Subscriptions Table**
```sql
CREATE TABLE review_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freight_forwarder_id UUID REFERENCES freight_forwarders(id),
    location_country VARCHAR(100),
    location_city VARCHAR(100),
    notification_frequency VARCHAR(20) DEFAULT 'immediate',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_review_subscriptions_user_id ON review_subscriptions(user_id);
CREATE INDEX idx_review_subscriptions_forwarder ON review_subscriptions(freight_forwarder_id);
CREATE INDEX idx_review_subscriptions_location ON review_subscriptions(location_country, location_city);
```

### **Notification Logs Table**
```sql
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES review_subscriptions(id),
    review_id UUID REFERENCES reviews(id),
    notification_type VARCHAR(50),
    email_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 **Implementation Priority**

### **Phase 1: Core Functionality**
1. Implement `POST /api/notifications/trigger-review-notification`
2. Basic email service setup
3. New review notification template

### **Phase 2: Subscription Management**
1. Implement `POST /api/notifications/cleanup-subscriptions`
2. Subscription confirmation emails
3. Cleanup notification emails

### **Phase 3: Monitoring & Analytics**
1. Implement `GET /api/notifications/status/{user_id}`
2. Notification delivery tracking
3. Error handling and retry logic

## 🔧 **Technical Requirements**

### **Dependencies**
```bash
pip install fastapi-mail jinja2 celery redis
```

### **Background Job System**
- Use Celery for async email sending
- Redis for job queue
- Retry failed notifications
- Rate limiting to prevent spam

### **Error Handling**
- Log all notification attempts
- Retry failed emails with exponential backoff
- Dead letter queue for permanently failed notifications
- Admin dashboard for monitoring

## 📊 **Testing Requirements**

### **Unit Tests**
- Subscription matching logic
- Email template rendering
- Database operations

### **Integration Tests**
- End-to-end notification flow
- Webhook integration
- Email delivery verification

### **Load Tests**
- High volume review submissions
- Concurrent notification processing
- Database performance under load

## 🔒 **Security Considerations**

- Rate limiting on notification endpoints
- Input validation and sanitization
- Email content filtering
- Unsubscribe token security
- GDPR compliance for email data

## 📈 **Monitoring & Metrics**

- Notification delivery rates
- Email bounce rates
- Subscription growth/decline
- Performance metrics
- Error rates and types

---

**Priority**: HIGH - This is required for the notification system to function properly.

**Estimated Implementation Time**: 2-3 weeks for full implementation.

**Dependencies**: Stripe webhook integration, email service setup, background job system.
