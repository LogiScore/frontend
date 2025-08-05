# LogiScore Backend

FastAPI backend for the LogiScore freight forwarder review platform.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL database
- SendGrid account (for email verification)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/LogiScore/backend.git
cd backend
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Run the development server**
```bash
uvicorn main:app --reload
```

## 📁 Project Structure

```
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── runtime.txt            # Python runtime version
├── render.yaml            # Render deployment configuration
├── env.example            # Environment variables template
├── email_service.py       # Email service for verification codes
├── documentation/         # Project documentation
├── auth/                  # Authentication module
│   └── auth.py           # JWT and OAuth logic
├── database/              # Database configuration
│   ├── database.py       # Database connection
│   └── models.py         # SQLAlchemy models
└── routes/               # API routes
    ├── __init__.py       # Routes package
    ├── admin.py          # Admin endpoints
    ├── auth.py           # Authentication endpoints
    ├── users.py          # User endpoints
    ├── freight_forwarders.py
    ├── reviews.py        # Review endpoints
    ├── subscriptions.py  # Subscription endpoints
    └── search.py         # Search endpoints
```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/logiscore

# JWT Secret
JWT_SECRET_KEY=your-secret-key

# Email Service
EMAIL_SERVICE=smtp
SMTP_HOST=mail.privateemail.com
SMTP_PORT=465
SMTP_USERNAME=your-email
SMTP_PASSWORD=your-password
FROM_EMAIL=noreply@logiscore.com

# Or for SendGrid
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
```

## 🚀 Deployment

### Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard

See `documentation/DEPLOYMENT.md` for detailed instructions.

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Authentication

The backend supports:
- **Email/Password**: Traditional login
- **Email Verification**: Code-based verification
- **GitHub OAuth**: Social login
- **JWT Tokens**: Stateless authentication

## 📧 Email Service

Supports multiple email providers:
- **PrivateEmail SMTP**: Default configuration
- **SendGrid**: API-based sending
- **Console Mode**: Development logging

## 🗄️ Database

- **PostgreSQL**: Primary database
- **SQLAlchemy**: ORM
- **Alembic**: Migrations (recommended for production)

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## 📖 Documentation

See the `documentation/` folder for:
- User Requirements
- Review Questions
- Deployment Guide
- Email Integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for LogiScore. 