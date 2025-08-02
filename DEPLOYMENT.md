# LogiScore Deployment Guide

This guide will help you deploy both the frontend (Vercel) and backend (Render) of the LogiScore platform.

## 🚀 Quick Deployment Steps

### 1. Backend Deployment (Render)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `logiscore-backend` directory
   - Configure:
     - **Name**: `logiscore-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   JWT_SECRET_KEY=your_jwt_secret_here
   DATABASE_URL=your_postgresql_url
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

4. **Database Setup**
   - Create a PostgreSQL database in Render
   - Update the DATABASE_URL environment variable
   - Run database migrations

### 2. Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: SvelteKit
     - **Root Directory**: `logiscore-frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.svelte-kit`

3. **Environment Variables**
   Add in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://your-backend-url.onrender.com
   ```

## 🔧 Manual Deployment Commands

### Backend (Render)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Render
# Use Render dashboard or:
render deploy
```

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd logiscore-frontend

# Deploy
vercel --prod
```

## 📋 Pre-Deployment Checklist

### Backend
- [ ] All dependencies in requirements.txt
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints working
- [ ] CORS configured for frontend domain

### Frontend
- [ ] API base URL configured
- [ ] Build process working
- [ ] Static assets included
- [ ] Environment variables set

## 🔗 URLs After Deployment

- **Frontend**: `https://logiscore-frontend.vercel.app`
- **Backend**: `https://logiscore-backend.onrender.com`
- **API Docs**: `https://logiscore-backend.onrender.com/docs`

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   - Check requirements.txt for missing dependencies
   - Verify Python version compatibility
   - Check for syntax errors

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check database credentials
   - Ensure database is accessible

3. **CORS Errors**
   - Update CORS origins in backend
   - Check frontend API URL configuration

4. **Environment Variables**
   - Verify all required variables are set
   - Check variable names and values
   - Restart deployment after changes

## 📞 Support

For deployment issues:
1. Check Render/Vercel logs
2. Verify environment variables
3. Test locally first
4. Check API documentation at `/docs`

## 🔄 Continuous Deployment

Both platforms support automatic deployments:
- **Render**: Automatic on git push to main branch
- **Vercel**: Automatic on git push to main branch

## 🚀 Next Steps

After deployment:
1. Test all subscription functionality
2. Verify payment integration
3. Set up monitoring and logging
4. Configure custom domains
5. Set up SSL certificates 