# Trial Reminder Email System - Backend Implementation

## 🎯 **Overview**
This document provides the complete implementation for trial reminder emails that notify users when their free trial is ending in 1 day.

## 📧 **Email Templates**

### **1. Trial Ending Warning Email Template**

**File**: `templates/trial_ending_warning.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your LogiScore Trial Ends Tomorrow</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .trial-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .features { background: white; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Your LogiScore Trial Ends Tomorrow</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ user_name }},</p>
            
            <p>Your <strong>{{ trial_duration }}-day free trial</strong> of LogiScore {{ plan_name }} ends tomorrow at {{ trial_end_time }}.</p>
            
            <div class="trial-info">
                <h3>🕐 Trial Details</h3>
                <p><strong>Plan:</strong> {{ plan_name }} - ${{ plan_price }}/{{ billing_cycle }}</p>
                <p><strong>Trial Started:</strong> {{ trial_start_date }}</p>
                <p><strong>Trial Ends:</strong> {{ trial_end_date }}</p>
                <p><strong>Time Remaining:</strong> Less than 24 hours</p>
            </div>
            
            <h3>What happens next?</h3>
            <p>If you don't take action, your subscription will automatically convert to a paid plan and you'll be charged <strong>${{ plan_price }}</strong> tomorrow.</p>
            
            <div class="features">
                <h3>🚀 Continue enjoying LogiScore benefits:</h3>
                <ul>
                    {% for feature in plan_features %}
                    <li>{{ feature }}</li>
                    {% endfor %}
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ continue_subscription_link }}" class="cta-button">Continue Subscription</a>
                <br>
                <a href="{{ cancel_subscription_link }}" style="color: #666; text-decoration: none;">Cancel Trial</a>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email or contact our support team.</p>
            
            <p>Best regards,<br>The LogiScore Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user_email }} because you have an active trial subscription.</p>
            <p>LogiScore - Freight Forwarder Review Platform</p>
        </div>
    </div>
</body>
</html>
```

### **2. Trial Ended Notification Email Template**

**File**: `templates/trial_ended_notification.html`

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your LogiScore Trial Has Ended</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .trial-info { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ Your LogiScore Trial Has Ended</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ user_name }},</p>
            
            <p>Your <strong>{{ trial_duration }}-day free trial</strong> of LogiScore {{ plan_name }} has ended.</p>
            
            <div class="trial-info">
                <h3>📅 Trial Summary</h3>
                <p><strong>Plan:</strong> {{ plan_name }} - ${{ plan_price }}/{{ billing_cycle }}</p>
                <p><strong>Trial Started:</strong> {{ trial_start_date }}</p>
                <p><strong>Trial Ended:</strong> {{ trial_end_date }}</p>
                <p><strong>Status:</strong> Trial completed</p>
            </div>
            
            <h3>What's next?</h3>
            <p>Your account has been downgraded to the free tier. You can still:</p>
            <ul>
                <li>Browse basic freight forwarder information</li>
                <li>Submit reviews</li>
                <li>View star ratings</li>
            </ul>
            
            <p>To regain full access to LogiScore features, you can subscribe anytime:</p>
            
            <div style="text-align: center;">
                <a href="{{ subscribe_link }}" class="cta-button">Subscribe Now</a>
            </div>
            
            <p><strong>Questions?</strong> Reply to this email or contact our support team.</p>
            
            <p>Best regards,<br>The LogiScore Team</p>
        </div>
        
        <div class="footer">
            <p>This email was sent to {{ user_email }} because your trial subscription has ended.</p>
            <p>LogiScore - Freight Forwarder Review Platform</p>
        </div>
    </div>
</body>
</html>
```

## 🔧 **Backend Implementation**

### **1. Email Service Extension**

**File**: `services/email_service.py` (add to existing EmailService class)

```python
async def send_trial_ending_warning(self, user_id: str, trial_data: Dict[str, Any]):
    """Send trial ending warning (1 day before)"""
    try:
        user = await self.get_user(user_id)
        
        template = self.template_env.get_template('trial_ending_warning.html')
        html_content = template.render(
            user_name=user.full_name or user.username,
            user_email=user.email,
            trial_duration=trial_data.get('trial_duration', 7),
            plan_name=trial_data.get('plan_name', 'Subscription'),
            plan_price=trial_data.get('plan_price', 0),
            billing_cycle=trial_data.get('billing_cycle', 'month'),
            trial_start_date=trial_data.get('trial_start_date'),
            trial_end_date=trial_data.get('trial_end_date'),
            trial_end_time=trial_data.get('trial_end_time'),
            plan_features=trial_data.get('plan_features', []),
            continue_subscription_link=f"https://logiscore.com/subscribe?plan={trial_data.get('plan_id')}",
            cancel_subscription_link=f"https://logiscore.com/cancel-trial?user_id={user_id}"
        )
        
        message = MessageSchema(
            subject=f"⚠️ Your LogiScore trial ends tomorrow - Action required",
            recipients=[user.email],
            body=html_content,
            subtype="html"
        )
        
        await self.mail.send_message(message)
        print(f"Trial ending warning sent to {user.email}")
        
    except Exception as e:
        print(f"Error sending trial ending warning to {user_id}: {str(e)}")

async def send_trial_ended_notification(self, user_id: str, trial_data: Dict[str, Any]):
    """Send trial ended notification"""
    try:
        user = await self.get_user(user_id)
        
        template = self.template_env.get_template('trial_ended_notification.html')
        html_content = template.render(
            user_name=user.full_name or user.username,
            user_email=user.email,
            trial_duration=trial_data.get('trial_duration', 7),
            plan_name=trial_data.get('plan_name', 'Subscription'),
            plan_price=trial_data.get('plan_price', 0),
            billing_cycle=trial_data.get('billing_cycle', 'month'),
            trial_start_date=trial_data.get('trial_start_date'),
            trial_end_date=trial_data.get('trial_end_date'),
            subscribe_link=f"https://logiscore.com/subscribe?plan={trial_data.get('plan_id')}"
        )
        
        message = MessageSchema(
            subject="❌ Your LogiScore trial has ended",
            recipients=[user.email],
            body=html_content,
            subtype="html"
        )
        
        await self.mail.send_message(message)
        print(f"Trial ended notification sent to {user.email}")
        
    except Exception as e:
        print(f"Error sending trial ended notification to {user_id}: {str(e)}")
```

### **2. Background Job for Trial Reminders**

**File**: `tasks/trial_tasks.py`

```python
from celery import shared_task
from datetime import datetime, timedelta
from services.subscription_service import SubscriptionService
from services.email_service import EmailService
from database import get_db
from sqlalchemy import text

subscription_service = SubscriptionService()
email_service = EmailService()

@shared_task
def check_trial_expiry():
    """Daily task to check trials ending in 1 day"""
    try:
        db = get_db()
        
        # Find trials ending in 1 day
        tomorrow = datetime.utcnow() + timedelta(days=1)
        start_of_tomorrow = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_tomorrow = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        # Query for trials ending tomorrow
        query = text("""
            SELECT u.id, u.email, u.full_name, u.username,
                   u.subscription_tier, u.subscription_start_date, u.subscription_end_date,
                   u.stripe_subscription_id
            FROM users u
            WHERE u.subscription_tier IN ('monthly', 'annual', 'enterprise')
            AND u.subscription_end_date BETWEEN :start_date AND :end_date
            AND u.subscription_status = 'trialing'
        """)
        
        result = db.execute(query, {
            'start_date': start_of_tomorrow,
            'end_date': end_of_tomorrow
        })
        
        trials_ending = result.fetchall()
        
        for trial in trials_ending:
            # Get trial data
            trial_data = {
                'trial_duration': 7,  # Default, should be calculated from start/end dates
                'plan_name': trial.subscription_tier.title(),
                'plan_price': get_plan_price(trial.subscription_tier),
                'billing_cycle': 'month' if trial.subscription_tier == 'monthly' else 'year',
                'trial_start_date': trial.subscription_start_date.strftime('%B %d, %Y'),
                'trial_end_date': trial.subscription_end_date.strftime('%B %d, %Y'),
                'trial_end_time': trial.subscription_end_date.strftime('%I:%M %p UTC'),
                'plan_id': trial.subscription_tier,
                'plan_features': get_plan_features(trial.subscription_tier)
            }
            
            # Send trial ending warning
            send_trial_ending_warning.delay(str(trial.id), trial_data)
            
        print(f"Found {len(trials_ending)} trials ending tomorrow")
        
    except Exception as e:
        print(f"Error in check_trial_expiry: {str(e)}")

@shared_task
def process_ended_trials():
    """Daily task to process trials that have ended"""
    try:
        db = get_db()
        
        # Find trials that ended yesterday
        yesterday = datetime.utcnow() - timedelta(days=1)
        start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_yesterday = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        query = text("""
            SELECT u.id, u.email, u.full_name, u.username,
                   u.subscription_tier, u.subscription_start_date, u.subscription_end_date
            FROM users u
            WHERE u.subscription_tier IN ('monthly', 'annual', 'enterprise')
            AND u.subscription_end_date BETWEEN :start_date AND :end_date
            AND u.subscription_status = 'trialing'
        """)
        
        result = db.execute(query, {
            'start_date': start_of_yesterday,
            'end_date': end_of_yesterday
        })
        
        ended_trials = result.fetchall()
        
        for trial in ended_trials:
            # Get trial data
            trial_data = {
                'trial_duration': 7,  # Default, should be calculated
                'plan_name': trial.subscription_tier.title(),
                'plan_price': get_plan_price(trial.subscription_tier),
                'billing_cycle': 'month' if trial.subscription_tier == 'monthly' else 'year',
                'trial_start_date': trial.subscription_start_date.strftime('%B %d, %Y'),
                'trial_end_date': trial.subscription_end_date.strftime('%B %d, %Y'),
                'plan_id': trial.subscription_tier
            }
            
            # Send trial ended notification
            send_trial_ended_notification.delay(str(trial.id), trial_data)
            
            # Update user subscription status
            subscription_service.mark_trial_ended(str(trial.id))
            
        print(f"Processed {len(ended_trials)} ended trials")
        
    except Exception as e:
        print(f"Error in process_ended_trials: {str(e)}")

@shared_task
def send_trial_ending_warning(user_id: str, trial_data: Dict[str, Any]):
    """Send trial ending warning email"""
    try:
        email_service.send_trial_ending_warning(user_id, trial_data)
    except Exception as e:
        print(f"Error sending trial ending warning to {user_id}: {str(e)}")

@shared_task
def send_trial_ended_notification(user_id: str, trial_data: Dict[str, Any]):
    """Send trial ended notification email"""
    try:
        email_service.send_trial_ended_notification(user_id, trial_data)
    except Exception as e:
        print(f"Error sending trial ended notification to {user_id}: {str(e)}")

def get_plan_price(plan_tier: str) -> int:
    """Get plan price based on tier"""
    prices = {
        'monthly': 38,
        'annual': 418,
        'enterprise': 3450
    }
    return prices.get(plan_tier, 0)

def get_plan_features(plan_tier: str) -> list:
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
```

### **3. Celery Beat Schedule**

**File**: `config/celery.py` (add to existing configuration)

```python
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'check-trial-expiry': {
        'task': 'tasks.trial_tasks.check_trial_expiry',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM UTC
    },
    'process-ended-trials': {
        'task': 'tasks.trial_tasks.process_ended_trials',
        'schedule': crontab(hour=10, minute=0),  # Daily at 10 AM UTC
    },
}
```

### **4. Stripe Webhook Integration**

**File**: `webhooks/stripe_webhooks.py` (add to existing webhook handlers)

```python
async def handle_trial_will_end(event):
    """Handle trial_will_end webhook from Stripe"""
    subscription = event['data']['object']
    user_id = subscription.metadata.get('user_id')
    
    if user_id:
        # Get subscription details
        trial_data = {
            'trial_duration': subscription.trial_period_days,
            'plan_name': subscription.items.data[0].price.nickname or 'Subscription',
            'plan_price': subscription.items.data[0].price.unit_amount / 100,
            'billing_cycle': 'month' if subscription.items.data[0].price.recurring.interval == 'month' else 'year',
            'trial_start_date': datetime.fromtimestamp(subscription.trial_start).strftime('%B %d, %Y'),
            'trial_end_date': datetime.fromtimestamp(subscription.trial_end).strftime('%B %d, %Y'),
            'trial_end_time': datetime.fromtimestamp(subscription.trial_end).strftime('%I:%M %p UTC'),
            'plan_id': subscription.items.data[0].price.id
        }
        
        # Send trial ending warning
        await email_service.send_trial_ending_warning(user_id, trial_data)
```

## 🚀 **Deployment Steps**

1. **Add email templates** to `templates/` directory
2. **Extend EmailService** with trial reminder methods
3. **Create trial_tasks.py** with Celery tasks
4. **Update Celery configuration** with beat schedule
5. **Add Stripe webhook handler** for trial events
6. **Test the system** with trial subscriptions

## 📊 **Monitoring**

- **Email delivery logs** in application logs
- **Celery task status** in Celery monitoring
- **Trial conversion rates** in analytics
- **User engagement** with trial reminder emails

## ⚠️ **Important Notes**

- **Timing**: Trials ending in 1 day get warnings at 9 AM UTC
- **Timezone**: All times are in UTC, consider user timezone for better UX
- **Rate limiting**: Implement email rate limiting to avoid spam
- **Testing**: Test with actual Stripe webhooks in staging environment
- **Fallback**: If Stripe webhooks fail, daily Celery tasks provide backup
