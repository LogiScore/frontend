# Trial Reminder API Endpoints - Quick Implementation

## 🎯 **Immediate Implementation Required**

These endpoints need to be implemented in the backend to support trial reminder emails.

## 📧 **API Endpoints**

### **1. Send Trial Ending Warning**

**Endpoint**: `POST /api/notifications/send-trial-warning`

**Purpose**: Send trial ending warning email (1 day before trial ends)

**Request Body**:
```json
{
  "user_id": "string",
  "trial_duration": 7,
  "plan_name": "Subscription Monthly",
  "plan_price": 38,
  "billing_cycle": "month",
  "trial_end_date": "2024-01-15T23:59:59Z",
  "plan_features": [
    "Search for Forwarders and view aggregated scores",
    "Full numerical score display",
    "Single user subscription"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Trial warning email sent successfully",
  "email_sent_to": "user@example.com"
}
```

### **2. Send Trial Ended Notification**

**Endpoint**: `POST /api/notifications/send-trial-ended`

**Purpose**: Send notification when trial has ended

**Request Body**:
```json
{
  "user_id": "string",
  "trial_duration": 7,
  "plan_name": "Subscription Monthly",
  "plan_price": 38,
  "billing_cycle": "month",
  "trial_end_date": "2024-01-14T23:59:59Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Trial ended notification sent successfully",
  "email_sent_to": "user@example.com"
}
```

### **3. Get Users with Trials Ending Soon**

**Endpoint**: `GET /api/notifications/trials-ending-soon`

**Purpose**: Get list of users whose trials end in the next 24 hours

**Query Parameters**:
- `hours_ahead`: Number of hours to look ahead (default: 24)

**Response**:
```json
{
  "success": true,
  "trials_ending": [
    {
      "user_id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "subscription_tier": "monthly",
      "trial_end_date": "2024-01-15T23:59:59Z",
      "plan_name": "Subscription Monthly",
      "plan_price": 38,
      "billing_cycle": "month"
    }
  ],
  "count": 1
}
```

## 🔄 **Integration with Frontend**

### **Frontend API Client Extension**

Add these methods to `src/lib/api.ts`:

```typescript
// Trial reminder methods
async sendTrialWarning(userId: string, trialData: any): Promise<{success: boolean; message: string; email_sent_to: string}> {
  return this.request<{success: boolean; message: string; email_sent_to: string}>('/api/notifications/send-trial-warning', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      ...trialData
    }),
  });
}

async sendTrialEndedNotification(userId: string, trialData: any): Promise<{success: boolean; message: string; email_sent_to: string}> {
  return this.request<{success: boolean; message: string; email_sent_to: string}>('/api/notifications/send-trial-ended', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      ...trialData
    }),
  });
}

async getTrialsEndingSoon(hoursAhead: number = 24): Promise<{success: boolean; trials_ending: any[]; count: number}> {
  return this.request<{success: boolean; trials_ending: any[]; count: number}>(`/api/notifications/trials-ending-soon?hours_ahead=${hoursAhead}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${this.getToken()}`,
    },
  });
}
```

## ⏰ **Background Job Implementation**

### **Simple Cron Job (Alternative to Celery)**

Create a simple cron job that runs daily:

```bash
# Add to crontab (runs daily at 9 AM UTC)
0 9 * * * /usr/bin/python3 /path/to/check_trial_expiry.py
```

**File**: `scripts/check_trial_expiry.py`

```python
#!/usr/bin/env python3
import requests
import os
from datetime import datetime, timedelta

# Backend API base URL
API_BASE_URL = os.getenv('BACKEND_API_URL', 'http://localhost:8000')
ADMIN_TOKEN = os.getenv('ADMIN_API_TOKEN')

def check_trials_ending():
    """Check for trials ending in 24 hours and send warnings"""
    try:
        # Get trials ending soon
        response = requests.get(
            f"{API_BASE_URL}/api/notifications/trials-ending-soon",
            headers={'Authorization': f'Bearer {ADMIN_TOKEN}'}
        )
        
        if response.status_code == 200:
            data = response.json()
            trials = data.get('trials_ending', [])
            
            print(f"Found {len(trials)} trials ending soon")
            
            for trial in trials:
                # Send trial warning
                warning_data = {
                    'trial_duration': 7,  # Default
                    'plan_name': trial['plan_name'],
                    'plan_price': trial['plan_price'],
                    'billing_cycle': trial['billing_cycle'],
                    'trial_end_date': trial['trial_end_date'],
                    'plan_features': get_plan_features(trial['subscription_tier'])
                }
                
                warning_response = requests.post(
                    f"{API_BASE_URL}/api/notifications/send-trial-warning",
                    headers={'Authorization': f'Bearer {ADMIN_TOKEN}'},
                    json={'user_id': trial['user_id'], **warning_data}
                )
                
                if warning_response.status_code == 200:
                    print(f"Trial warning sent to {trial['email']}")
                else:
                    print(f"Failed to send warning to {trial['email']}: {warning_response.text}")
        else:
            print(f"Failed to get trials ending soon: {response.text}")
            
    except Exception as e:
        print(f"Error checking trial expiry: {str(e)}")

def get_plan_features(plan_tier):
    """Get plan features based on tier"""
    features = {
        'monthly': [
            'Search for Forwarders and view aggregated scores',
            'Full numerical score display',
            'Single user subscription'
        ],
        'annual': [
            'Everything in Monthly plan',
            'Email notifications for new reviews',
            'Score trend analytics',
            'Save $38/year compared to monthly'
        ],
        'enterprise': [
            'Everything in Annual plan',
            'Up to three concurrent users',
            'Manage forwarder profile',
            'Branded ads on profile page',
            'Comment on reviews',
            'Best in location badge'
        ]
    }
    return features.get(plan_tier, [])

if __name__ == "__main__":
    check_trials_ending()
```

## 🚀 **Quick Start Implementation**

1. **Backend Team**: Implement the 3 API endpoints above
2. **Frontend Team**: Add the API client methods
3. **DevOps Team**: Set up the cron job or Celery beat schedule
4. **Testing**: Test with trial subscriptions

## 📊 **Monitoring & Testing**

- **Test endpoint**: Use the API endpoints directly to test email sending
- **Monitor logs**: Check application logs for email delivery status
- **Trial data**: Ensure trial end dates are properly stored in database
- **Email templates**: Test with actual email templates

## ⚠️ **Critical Requirements**

- **Timing**: Send warnings exactly 24 hours before trial ends
- **Email delivery**: Ensure emails are actually delivered (check spam folders)
- **User experience**: Clear call-to-action buttons in emails
- **Fallback**: If automated system fails, manual process should exist
- **Testing**: Test with real trial subscriptions before production
