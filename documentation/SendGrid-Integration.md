# SendGrid Email Integration

This document outlines how to integrate SendGrid email service with the LogiScore application.

## Prerequisites

- Python 2.6, 2.7, 3.4 or 3.5+
- SendGrid account
- API key from SendGrid dashboard

## Setup Instructions

### 1. Create SendGrid API Key

1. Log into your SendGrid account
2. Navigate to Settings > API Keys
3. Create a new API key with appropriate permissions
4. Copy the generated API key (starts with `SG.`)

### 2. Environment Configuration

Add your SendGrid API key to your environment variables:

```bash
export SENDGRID_API_KEY='YOUR_API_KEY_HERE'
```

For development, you can create a `.env` file:

```bash
echo "SENDGRID_API_KEY=YOUR_API_KEY_HERE" > .env
echo ".env" >> .gitignore
```

### 3. Install SendGrid Package

```bash
pip install sendgrid
```

### 4. Implementation Example

```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_verification_email(to_email, verification_code):
    message = Mail(
        from_email='noreply@logiscore.com',
        to_emails=to_email,
        subject='LogiScore - Email Verification',
        html_content=f'''
        <h2>Welcome to LogiScore!</h2>
        <p>Your verification code is: <strong>{verification_code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        '''
    )
    
    try:
        sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
```

## EU Data Residency

For EU Data Resident sending, include the data residency setting:

```python
sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
sg.set_sendgrid_data_residency("eu")
```

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive configuration
- Rotate API keys regularly
- Monitor API usage and set appropriate rate limits

## Troubleshooting

- **Status Code 202**: Email sent successfully
- **Status Code 400**: Bad request (check email format)
- **Status Code 401**: Authentication failed (check API key)
- **Status Code 403**: Forbidden (check API key permissions)

For more information, visit the [SendGrid Python Documentation](https://github.com/sendgrid/sendgrid-python). 