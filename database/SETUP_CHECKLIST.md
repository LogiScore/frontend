# LogiScore Database Setup Checklist

## 🚀 Pre-Setup Tasks

- [ ] **Create Supabase Project**
  - [ ] Sign up at supabase.com
  - [ ] Create new project
  - [ ] Note project URL and credentials
  - [ ] Enable Row Level Security (RLS)

- [ ] **Configure Environment**
  - [ ] Copy `env.example` to `.env`
  - [ ] Update `DATABASE_URL` with Supabase credentials
  - [ ] Update `SUPABASE_URL` and keys
  - [ ] Generate strong `JWT_SECRET_KEY`
  - [ ] Test environment variable loading

- [ ] **Install Dependencies**
  - [ ] Install `psycopg2-binary`
  - [ ] Install `python-dotenv`
  - [ ] Verify Python 3.9+ is installed

## 📋 Database Setup Tasks

- [ ] **Run Schema Creation**
  - [ ] Execute `python database/setup_database.py`
  - [ ] Verify all tables are created
  - [ ] Check indexes are properly created
  - [ ] Confirm triggers are working

- [ ] **Data Population**
  - [ ] Load freight forwarders from CSV (400+ companies)
  - [ ] Create sample branches for major forwarders
  - [ ] Create test users (admin + regular user)
  - [ ] Add sample reviews with ratings
  - [ ] Verify data relationships

- [ ] **Verification**
  - [ ] Check record counts in all tables
  - [ ] Test database connection from backend
  - [ ] Verify foreign key relationships
  - [ ] Test basic queries

## 🔧 Backend Testing

- [ ] **API Connection**
  - [ ] Start backend server (`uvicorn main:app --reload`)
  - [ ] Test health endpoint (`/health`)
  - [ ] Test freight forwarders endpoint (`/api/freight-forwarders`)
  - [ ] Test search endpoint (`/api/search`)

- [ ] **Authentication**
  - [ ] Test user registration (if implemented)
  - [ ] Test login flow
  - [ ] Verify JWT token generation
  - [ ] Test protected endpoints

## 🎨 Frontend Integration

- [ ] **Environment Setup**
  - [ ] Update frontend environment variables
  - [ ] Configure API base URL
  - [ ] Set up Supabase client

- [ ] **API Integration**
  - [ ] Test freight forwarder listing
  - [ ] Test search functionality
  - [ ] Test review submission (if implemented)
  - [ ] Verify data display

## 🔒 Security & Production

- [ ] **Security Review**
  - [ ] Verify `.env` is in `.gitignore`
  - [ ] Check RLS policies are active
  - [ ] Review API rate limiting
  - [ ] Test input validation

- [ ] **Production Preparation**
  - [ ] Set up production environment variables
  - [ ] Configure proper CORS settings
  - [ ] Set up monitoring and logging
  - [ ] Plan backup strategy

## 📊 Data Verification

After setup, verify you have:

### Tables Created
- [ ] `users` - User accounts
- [ ] `freight_forwarders` - Company data
- [ ] `branches` - Branch locations
- [ ] `reviews` - User reviews
- [ ] `review_category_scores` - Rating details
- [ ] `disputes` - Dispute management
- [ ] `ad_campaigns` - Advertising
- [ ] `user_sessions` - Session tracking

### Data Loaded
- [ ] 400+ freight forwarders
- [ ] Sample branches for major companies
- [ ] Test users (admin + regular)
- [ ] Sample reviews with ratings
- [ ] Proper foreign key relationships

### API Endpoints Working
- [ ] `/health` - Health check
- [ ] `/api/freight-forwarders` - List companies
- [ ] `/api/search` - Search functionality
- [ ] `/api/users` - User management
- [ ] `/api/reviews` - Review management

## 🚨 Troubleshooting

### Common Issues
- [ ] Database connection failed → Check `DATABASE_URL`
- [ ] Schema creation failed → Verify SQL syntax
- [ ] CSV import failed → Check file path and encoding
- [ ] API errors → Check environment variables
- [ ] CORS issues → Verify CORS configuration

### Next Steps After Setup
1. **Test full user flow** - Search → View → Review
2. **Implement authentication** - GitHub OAuth
3. **Add payment integration** - Stripe setup
4. **Deploy to production** - Render/Vercel
5. **Set up monitoring** - Error tracking

---

## 📝 Notes

- **Database URL Format**: `postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
- **JWT Secret**: Generate a strong random string for production
- **CSV File**: Located at `assets/LogiScore_table_freight_forwarders_data.csv`
- **Setup Script**: `database/setup_database.py`

## 🎯 Success Criteria

✅ Database is accessible and responsive  
✅ All tables created with proper relationships  
✅ Sample data loaded and queryable  
✅ API endpoints return expected data  
✅ Frontend can connect and display data  
✅ Authentication flow works (if implemented)  

---

*Checklist Status: Ready to Begin*  
*Last Updated: 2025-01-26* 