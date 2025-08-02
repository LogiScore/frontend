# LogiScore Platform

A comprehensive freight forwarding review and rating platform with subscription management.

## Repository Structure

This project consists of two separate repositories:

### Frontend Repository
- **URL**: https://github.com/LogiScore/frontend
- **Technology**: SvelteKit + TypeScript
- **Deployment**: Vercel
- **Features**: User interface, subscription management, authentication

### Backend Repository
- **URL**: https://github.com/LogiScore/backend
- **Technology**: FastAPI + Python
- **Deployment**: Render
- **Features**: API endpoints, database management, authentication

## Quick Start

### Frontend Development
```bash
# Clone the frontend repository
git clone https://github.com/LogiScore/frontend.git
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Development
```bash
# Clone the backend repository
git clone https://github.com/LogiScore/backend.git
cd backend

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub account to Vercel
2. Import the `LogiScore/frontend` repository
3. Configure environment variables:
   - `VITE_API_BASE_URL`: Backend API URL
4. Deploy

### Backend Deployment (Render)
1. Connect your GitHub account to Render
2. Create a new Web Service from `LogiScore/backend`
3. Set root directory to `logiscore-backend`
4. Configure environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_KEY`: Supabase service key
   - `JWT_SECRET`: JWT signing secret
5. Deploy

## Features

### Frontend Features
- ✅ User authentication (sign up/sign in)
- ✅ Subscription management with modal
- ✅ Pricing page with working buttons
- ✅ Responsive design
- ✅ API integration with backend

### Backend Features
- ✅ User authentication endpoints
- ✅ Subscription management API
- ✅ Database integration (PostgreSQL/Supabase)
- ✅ CORS configuration
- ✅ JWT token authentication

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/plans` - Get available plans
- `GET /api/subscriptions/current` - Get current subscription

### Other Endpoints
- `GET /api/freight-forwarders` - List freight forwarders
- `GET /api/reviews` - Get reviews
- `GET /api/search` - Search functionality

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-key
JWT_SECRET=your-jwt-secret
```

## Development Workflow

1. **Frontend Changes**: Make changes in the frontend repository
2. **Backend Changes**: Make changes in the backend repository
3. **Testing**: Test locally with both services running
4. **Deployment**: Deploy backend first, then frontend
5. **Verification**: Test deployed services

## Troubleshooting

### Common Issues
- **CORS Errors**: Ensure backend CORS settings include frontend URL
- **API Connection**: Verify `VITE_API_BASE_URL` points to correct backend
- **Authentication**: Check JWT token handling in both frontend and backend

### Deployment Issues
- **Render Backend**: Check logs for database connection issues
- **Vercel Frontend**: Verify environment variables are set correctly

## Contributing

1. Fork the respective repository (frontend or backend)
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to LogiScore.
