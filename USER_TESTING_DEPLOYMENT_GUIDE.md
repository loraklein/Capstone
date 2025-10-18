# PastForward - User Testing Deployment Guide

This guide will help you deploy your app for user testing in 3 ways: Web, Mobile (Expo Go), and Native Apps.

---

## 🎯 Quick Summary: What You Need to Do

1. ✅ **Backend** - Already deployed on Render
2. 🔑 **Google Vision API** - Set up API key (see `GOOGLE_VISION_SETUP.md`)
3. 🌐 **Frontend Web** - Deploy to Netlify/Vercel (instructions below)
4. 📱 **Mobile Testing** - Share via Expo Go OR build native apps

---

## Part 1: Backend Setup (Update for Google Vision)

### Step 1: Add Google Vision API Key to Render

After you get your API key from Google Cloud (follow `GOOGLE_VISION_SETUP.md`):

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click on your **backend service**
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   - **Key**: `GOOGLE_CLOUD_API_KEY`
   - **Value**: `AIzaSy...` (your actual API key)
6. Click **Save Changes**

Your backend will automatically redeploy (~2-3 minutes). That's it for the backend! ✅

---

## Part 2: Frontend Web Deployment (Netlify - Easiest)

### Why Web?
- ✅ Easiest to share (just send a link)
- ✅ No app store approval needed
- ✅ Works on any device with a browser
- ⚠️ Camera features won't work well (but you can create pre-populated test account)

### Option A: Deploy to Netlify (Recommended)

1. **Build your web app locally first (test it works):**
   ```bash
   cd /Users/loraklein/AdvWeb/Capstone
   npx expo export --platform web
   ```
   This creates a `dist` folder with your web app.

2. **Sign up for Netlify:**
   - Go to: https://www.netlify.com/
   - Sign up with GitHub (free)

3. **Deploy via Netlify Drop (Super Easy):**
   - After signing in, go to: https://app.netlify.com/drop
   - Drag and drop your `dist` folder onto the page
   - Netlify will give you a URL like: `https://random-name-12345.netlify.app`
   - **Rename it**: Click "Site settings" → "Change site name" → `pastforward-testing`
   - New URL: `https://pastforward-testing.netlify.app`

4. **Test it:**
   - Open the URL in your browser
   - Try logging in / signing up
   - Everything should work!

### Option B: Deploy to Vercel (Alternative)

Very similar to Netlify:

1. Build: `npx expo export --platform web`
2. Sign up: https://vercel.com/
3. Install Vercel CLI: `npm install -g vercel`
4. Deploy: `vercel --prod` (from your project directory)
5. Follow prompts, get URL

### Important: Update CORS on Backend

After you get your web URL, update your backend to allow requests from it:

1. Edit `backend/src/index.ts` line 28-33
2. Change:
   ```typescript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://yourdomain.com'] // Replace with your production domain
       : true,
     credentials: true
   }));
   ```
   To:
   ```typescript
   app.use(cors({
     origin: process.env.NODE_ENV === 'production' 
       ? ['https://pastforward-testing.netlify.app'] // Your actual URL
       : true,
     credentials: true
   }));
   ```
3. Commit and push to redeploy Render

---

## Part 3: Mobile Testing Options

### Option A: Expo Go (Quick & Easy Mobile Testing)

**Best for:** Quick testing on iOS/Android without building apps

1. **Make sure your app works with Expo Go:**
   Your app already supports this! Just ensure you're using Expo SDK compatible features.

2. **Publish your app to Expo:**
   ```bash
   npx expo login
   npx expo publish
   ```

3. **Share with testers:**
   - Testers install **Expo Go** app (iOS App Store / Google Play)
   - Share the Expo link or QR code
   - They scan it in Expo Go
   - App opens and works!

**Pros:**
- ✅ No app store submission
- ✅ Works on both iOS and Android
- ✅ Camera features work!

**Cons:**
- ⚠️ Testers need to install Expo Go first
- ⚠️ Some native features might not work

### Option B: Build Native Apps with EAS (Most Professional)

**Best for:** Real app testing, TestFlight, Play Store

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Configure EAS:**
   ```bash
   eas build:configure
   ```

3. **Build for iOS (TestFlight):**
   ```bash
   eas build --platform ios --profile preview
   ```
   - This creates an actual iOS app
   - You can submit to TestFlight for beta testing
   - Testers can install via TestFlight app

4. **Build for Android:**
   ```bash
   eas build --platform android --profile preview
   ```
   - Creates an APK file
   - Testers can download and install directly
   - OR submit to Google Play beta

**Pros:**
- ✅ Real native apps
- ✅ All features work perfectly
- ✅ Professional testing experience

**Cons:**
- ⚠️ Takes 10-30 minutes to build
- ⚠️ iOS requires Apple Developer account ($99/year)
- ⚠️ More complex setup

---

## Part 4: Creating Test Accounts with Pre-populated Data

Since camera doesn't work well on web, create demo accounts:

### Manual Approach:

1. **Create test account:**
   - Sign up through your app: `testuser@example.com`

2. **Add sample projects (use mobile or Expo Go):**
   - Use the mobile version or Expo Go on your phone
   - Create 2-3 projects
   - Add 5-10 pages with real photos
   - Let AI process them

3. **Share credentials:**
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
   - Give this to testers

### Automated Approach (Optional):

You could create a seed script to populate test data directly in Supabase.

---

## Part 5: What to Give Testers

### For Web Testing:
```
🌐 PastForward Web App Testing

URL: https://pastforward-testing.netlify.app

Test Account:
- Email: testuser@example.com
- Password: TestPassword123!

Notes:
- Camera features won't work on web
- Use the test account to see existing projects
- Try creating/editing projects, viewing PDFs, etc.
```

### For Mobile Testing (Expo Go):
```
📱 PastForward Mobile Testing

1. Install Expo Go:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Open this link on your phone:
   exp://[your-expo-url]

   OR scan this QR code:
   [QR code image]

3. Create your own account or use test account:
   - Email: testuser@example.com
   - Password: TestPassword123!
```

---

## Part 6: Testing Checklist

Before sharing with users, test:

- [ ] Sign up works
- [ ] Sign in works
- [ ] Create new project
- [ ] Add pages (mobile only)
- [ ] View extracted text
- [ ] Edit project details
- [ ] Delete pages/projects
- [ ] Export PDF
- [ ] View recent pages
- [ ] Settings work

---

## Cost Breakdown for User Testing

### Free:
- ✅ Netlify/Vercel hosting (free tier)
- ✅ Render backend (free tier - already using)
- ✅ Supabase (free tier - already using)
- ✅ Expo Go testing
- ✅ Google Vision (first 1,000 requests/month)

### Paid (Optional):
- 💵 EAS Build: Free for open source, otherwise $29/month
- 💵 Apple Developer: $99/year (only if you want TestFlight)
- 💵 Google Vision: ~$1.50 per 1,000 after free tier

**Estimated Total for 10-20 testers: $0-5** 🎉

---

## Recommended Approach for Your Capstone

I recommend this combination:

1. **Deploy web version** (Netlify) - For quick sharing and desktop testing
2. **Use Expo Go** - For mobile testers who want to test camera features
3. **Create 1-2 pre-populated test accounts** - For web testers

This gives you:
- ✅ Zero cost
- ✅ Easy to share
- ✅ Both web and mobile testing
- ✅ Camera features work (on mobile)
- ✅ Professional enough for capstone presentation

---

## Need Help?

- Netlify deployment issues? Check: https://docs.expo.dev/distribution/publishing-websites/
- Expo Go issues? Check: https://docs.expo.dev/get-started/expo-go/
- Google Vision not working? Check your API key in Render environment variables

---

## Next Steps

1. ✅ Get Google Cloud API key (follow `GOOGLE_VISION_SETUP.md`)
2. ✅ Add API key to Render
3. ✅ Build and deploy web version to Netlify
4. ✅ Create test account with sample data
5. ✅ Share with 2-3 people first to test
6. ✅ Fix any issues
7. ✅ Share with all your user testers!

Good luck! 🚀

