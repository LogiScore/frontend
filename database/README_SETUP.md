# LogiScore Database Setup Guide

This guide will help you set up the LogiScore database with Supabase and populate it with initial data.

## Prerequisites

1. **Python 3.9+** installed
2. **Supabase account** created
3. **GitHub OAuth app** configured (optional for initial setup)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project details:
   - Project URL: `https://[PROJECT_REF].supabase.co`
   - Database password
   - Anon key
   - Service key

## Step 2: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp logiscore-backend/env.example logiscore-backend/.env
   ```

2. Update `logiscore-backend/.env` with your Supabase credentials:
   ```env
   # Database Configuration
   DATABASE_URL=postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   
   # Supabase Configuration
   SUPABASE_URL=https://[PROJECT_REF].supabase.co
   SUPABASE_ANON_KEY=[ANON_KEY]
   SUPABASE_SERVICE_KEY=[SERVICE_KEY]
   
   # JWT Configuration
   JWT_SECRET_KEY=your-super-secret-jwt-key-here
   
   # GitHub OAuth Configuration (optional for initial setup)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Stripe Configuration (optional for initial setup)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Application Configuration
   ENVIRONMENT=development
   DEBUG=True
   ```

## Step 3: Install Dependencies

1. Navigate to the backend directory:
   ```bash
   cd logiscore-backend
   ```

2. Install required packages:
   ```bash
   pip install psycopg2-binary python-dotenv
   ```

## Step 4: Run Database Setup

1. Run the database setup script:
   ```bash
   python database/setup_database.py
   ```

2. The script will:
   - Create all database tables
   - Load freight forwarders from CSV
   - Create sample branches
   - Create test users
   - Create sample reviews
   - Verify the setup

## Step 5: Verify Setup

1. Check the Supabase dashboard to see your tables
2. Test the API connection:
   ```bash
   cd logiscore-backend
   python -c "
   from database.database import get_db
   db = next(get_db())
   print('Database connection successful!')
   "
   ```

## Step 6: Test API Endpoints

1. Start the backend server:
   ```bash
   cd logiscore-backend
   uvicorn main:app --reload
   ```

2. Test the health endpoint:
   ```bash
   curl http://localhost:8000/health
   ```

3. Test freight forwarders endpoint:
   ```bash
   curl http://localhost:8000/api/freight-forwarders
   ```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify your `DATABASE_URL` is correct
   - Check if your Supabase project is active
   - Ensure the database password is correct

2. **Schema Creation Failed**
   - Check if you have proper permissions in Supabase
   - Verify the SQL syntax in `supabase_schema.sql`

3. **CSV Import Failed**
   - Ensure the CSV file path is correct
   - Check file encoding (should be UTF-8)
   - Verify CSV column names match expected format

### Getting Help

- Check the Supabase logs in your project dashboard
- Review the Python error messages for specific issues
- Verify all environment variables are set correctly

## Next Steps

After successful database setup:

1. **Test Frontend Connection**
   - Update frontend environment variables
   - Test authentication flow
   - Verify search functionality

2. **Configure GitHub OAuth**
   - Create GitHub OAuth app
   - Update environment variables
   - Test authentication

3. **Set up Stripe**
   - Create Stripe account
   - Configure webhooks
   - Test payment flow

## Database Schema Overview

The setup creates the following tables:

- **users**: User accounts and authentication
- **freight_forwarders**: Company information
- **branches**: Branch locations and details
- **reviews**: User reviews and ratings
- **review_category_scores**: Detailed rating breakdowns
- **disputes**: Review dispute management
- **ad_campaigns**: Advertising campaigns
- **user_sessions**: Session management

## Data Verification

After setup, you should have:

- ✅ 400+ freight forwarders loaded
- ✅ Sample branches for major companies
- ✅ Test users (admin and regular user)
- ✅ Sample reviews with ratings
- ✅ All database tables created with proper relationships

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Use strong JWT secrets in production
- Regularly rotate database passwords
- Monitor database access logs

---

*Last Updated: 2025-01-26*
*Status: Ready for Development* 