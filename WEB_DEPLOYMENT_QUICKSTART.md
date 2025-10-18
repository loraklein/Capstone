# Web Deployment Quick Start

## Prerequisites
✅ Backend deployed on Render  
✅ Google Vision API key added to Render environment variables

## Deploy to Netlify (5 minutes)

### Step 1: Build for Web
```bash
cd /Users/loraklein/AdvWeb/Capstone
npx expo export --platform web
```

This creates a `dist/` folder with your web app.

### Step 2: Deploy to Netlify

**Option A: Drag & Drop (Easiest)**
1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder onto the page
3. Done! You'll get a URL like: `https://random-name.netlify.app`

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Step 3: Custom Domain (Optional)
1. In Netlify dashboard, click "Domain settings"
2. Click "Options" → "Edit site name"
3. Change to: `pastforward-testing`
4. New URL: `https://pastforward-testing.netlify.app`

## Important Notes

### Camera Limitations on Web
- 📸 Camera component won't work well on web browsers
- 💡 **Solution**: Create test accounts with pre-populated data
- ✅ All other features (viewing, editing, PDF export) work fine

### Create Test Account
1. Use mobile version or Expo Go
2. Create account: `demo@pastforward.app` / `DemoPassword123!`
3. Add 5-10 sample projects with pages
4. Share credentials with web testers

### Environment Variables
The app automatically uses the production backend URL:
- Backend: `https://capstone-backend-og2c.onrender.com/api`
- No additional configuration needed!

## Test Your Deployment

After deploying, test these features:
- [ ] Sign up / Sign in
- [ ] View projects
- [ ] Edit project details
- [ ] View pages and extracted text
- [ ] Delete items
- [ ] Export PDF
- [ ] Dark/light mode toggle

## Troubleshooting

**"Network request failed"**
- Check backend is running: https://capstone-backend-og2c.onrender.com/health
- Verify CORS is configured (should be after following setup)

**"Can't take photos"**
- Expected on web! Use test account with pre-populated data

**Build fails**
- Clear expo cache: `npx expo start --clear`
- Delete `dist` folder and rebuild

## Alternative: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build
npx expo export --platform web

# Deploy
cd dist
vercel --prod
```

## Update Your Deployment

When you make changes:

```bash
# Rebuild
npx expo export --platform web

# Redeploy to Netlify
netlify deploy --prod --dir=dist

# Or drag & drop the new dist folder to Netlify
```

---

**Next**: See `USER_TESTING_DEPLOYMENT_GUIDE.md` for complete testing instructions!

