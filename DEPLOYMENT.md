# LogiScore Deployment Guide

This guide covers deployment for the LogiScore platform using the correct repository structure.

## Repository Structure

- **Frontend**: https://github.com/LogiScore/frontend
- **Backend**: https://github.com/LogiScore/backend

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub account

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect to GitHub repository: `LogiScore/backend`
3. Configure the service:
   - **Name**: `logiscore-backend`
   - **Root Directory**: `logiscore-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Environment Variables
Add these environment variables in Render:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/logiscore
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-service-key
JWT_SECRET=your-secure-jwt-secret-key
PYTHON_VERSION=3.11.0
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Note the service URL (e.g., `https://logiscore-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with your GitHub account

### 2. Import Repository
1. Click "New Project"
2. Import Git repository: `LogiScore/frontend`
3. Configure the project:
   - **Framework Preset**: SvelteKit
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.svelte-kit/output`

### 3. Environment Variables
Add this environment variable in Vercel:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

**Important**: Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### 4. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Your frontend will be available at the Vercel URL

## Verification Steps

### 1. Test Backend API
```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Test subscription plans endpoint
curl https://your-backend-url.onrender.com/api/subscriptions/plans
```

### 2. Test Frontend
1. Visit your Vercel frontend URL
2. Test subscription buttons on pricing page
3. Verify API integration works

### 3. Test Full Flow
1. Sign up/sign in on frontend
2. Navigate to pricing page
3. Click subscription buttons
4. Verify subscription modal opens
5. Test subscription creation

## Troubleshooting

### Backend Issues
- **Build Failures**: Check Python version and dependencies
- **Database Connection**: Verify `DATABASE_URL` is correct
- **CORS Errors**: Ensure frontend URL is in CORS settings

### Frontend Issues
- **API Connection**: Verify `VITE_API_BASE_URL` points to correct backend
- **Build Errors**: Check Node.js version and dependencies
- **Environment Variables**: Ensure all required variables are set

### Common Solutions
1. **Redeploy Backend**: If API endpoints return 404
2. **Redeploy Frontend**: If API URL changes
3. **Check Logs**: Use Render/Vercel logs for debugging

## Monitoring

### Render Backend
- Monitor logs in Render dashboard
- Check service status and uptime
- Monitor resource usage

### Vercel Frontend
- Monitor deployment status
- Check function execution logs
- Monitor performance metrics

## Updates and Maintenance

### Backend Updates
1. Push changes to `LogiScore/backend`
2. Render will auto-deploy
3. Test API endpoints

### Frontend Updates
1. Push changes to `LogiScore/frontend`
2. Vercel will auto-deploy
3. Test frontend functionality

### Environment Variable Updates
- Update in respective platform dashboards
- Redeploy services if needed
- Test functionality after updates

## Security Considerations

1. **Environment Variables**: Never commit secrets to repositories
2. **CORS**: Configure properly to prevent unauthorized access
3. **JWT Secrets**: Use strong, unique secrets
4. **Database**: Use secure connection strings
5. **HTTPS**: Both platforms provide HTTPS by default

## Support

For deployment issues:
1. Check platform documentation (Render/Vercel)
2. Review application logs
3. Test locally first
4. Verify environment variables
5. Check network connectivity 