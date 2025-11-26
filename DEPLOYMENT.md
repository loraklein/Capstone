# Deployment Guide

## Backend Deployment (Render)

Your backend is already configured for: `https://capstone-backend-og2c.onrender.com`

### Steps to deploy backend updates:

1. **Commit and push your backend changes:**
   ```bash
   git add .
   git commit -m "Update backend with PDF export features"
   git push origin main
   ```

2. **Render will auto-deploy** from your GitHub repo (if connected)
   - Go to: https://dashboard.render.com
   - Find your service: `capstone-backend`
   - Click "Manual Deploy" → "Deploy latest commit" if auto-deploy isn't working

3. **Verify environment variables are set:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_CLOUD_API_KEY`
   - `AI_PROVIDER=google_vision`
   - `NODE_ENV=production`

4. **Check backend health:**
   ```bash
   curl https://capstone-backend-og2c.onrender.com/api/health
   ```

---

## Frontend Deployment (Netlify)

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Build and deploy:**
   ```bash
   npm run export:web
   netlify deploy --prod --dir=dist
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Go to:** https://app.netlify.com
2. **Click:** "Add new site" → "Import an existing project"
3. **Connect:** Your GitHub repository
4. **Configure build settings:**
   - Build command: `npm run export:web`
   - Publish directory: `dist`
   - Environment variables:
     - `NODE_VERSION`: `20`
     - `EXPO_PUBLIC_API_URL`: `https://capstone-backend-og2c.onrender.com/api`

5. **Deploy:** Click "Deploy site"

---

## Post-Deployment Checklist

- [ ] Backend is running on Render
- [ ] Frontend is deployed on Netlify
- [ ] Can access the app URL (will be something like `https://pastforward.netlify.app`)
- [ ] Can sign in/sign up
- [ ] Can create a project
- [ ] Can upload and scan pages
- [ ] Can export PDFs (Quick Export, Custom PDF, Printable Book)
- [ ] Page numbers work in Printable Books
- [ ] Settings are applied correctly

---

## Environment Configuration

### Frontend (Netlify)
The frontend will automatically use:
- **Development:** `http://localhost:3001/api` (when running locally)
- **Production:** `https://capstone-backend-og2c.onrender.com/api` (from netlify.toml)

### Backend (Render)
Make sure these environment variables are set in Render dashboard:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLOUD_API_KEY`
- `AI_PROVIDER=google_vision`
- `NODE_ENV=production`
- `PORT=3001` (Render will override this automatically)

---

## Troubleshooting

### Backend not responding
- Check Render logs: https://dashboard.render.com → Your service → Logs
- Verify environment variables are set
- Check if service is sleeping (free tier sleeps after 15 min)

### Frontend can't connect to backend
- Check browser console for CORS errors
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check backend health endpoint

### PDF export not working
- Check backend logs for Puppeteer errors
- Verify Chrome is installed in Render (should auto-install)
- Check memory usage (PDF generation is memory-intensive)

---

## Quick Commands

```bash
# Deploy backend (if manual)
cd backend
git push origin main

# Build frontend locally (test before deploying)
npm run export:web

# Deploy frontend to Netlify
netlify deploy --prod --dir=dist

# View Netlify deployment logs
netlify logs

# Open deployed site
netlify open:site
```
