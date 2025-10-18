# 🚀 User Testing Launch Checklist

Use this checklist to get your app ready for user testers!

## Phase 1: Google Vision Setup (15 minutes)

- [x] Go to https://console.cloud.google.com/
- [x] Sign in with your Gmail
- [x] Create new project: "Capstone"
- [x] Search for "Vision API" and enable it
- [x] Set up billing (add credit card - won't be charged for free tier)
- [x] Create API key (Credentials → Create Credentials → API Key)
- [x] Restrict API key to Vision API only
- [x] Copy your API key (starts with `AIzaSy...`)

📖 **Detailed guide**: `GOOGLE_VISION_SETUP.md`

## Phase 2: Update Backend (2 minutes)

- [x] Go to https://dashboard.render.com/
- [x] Click on your backend service
- [x] Go to "Environment" tab
- [x] Add new environment variable:
  - Key: `GOOGLE_CLOUD_API_KEY`
  - Value: [paste your API key]
- [x] Click "Save Changes"
- [x] Wait for auto-redeploy (~2 minutes)
- [x] Test backend is running: https://capstone-backend-og2c.onrender.com/health

## Phase 3: Deploy Web Frontend (5 minutes)

- [x] Open terminal in your project
- [x] Run: `npx expo export --platform web`
- [x] Wait for build to complete
- [x] Verify `dist` folder was created
- [x] Go to https://app.netlify.com/drop
- [x] Drag the `dist` folder onto the page
- [x] Wait for upload
- [x] Copy your URL: `https://[random-name].netlify.app`
- [-] (Optional) Rename site to `pastforward-testing`
- [x] Test the web app in your browser

📖 **Detailed guide**: `WEB_DEPLOYMENT_QUICKSTART.md`

## Phase 4: Create Test Account (10 minutes)

### Option A: Use Expo Go on Your Phone
- [x] Install Expo Go (iOS App Store / Google Play)
- [x] Run: `npx expo start` in your project
- [x] Scan QR code with Expo Go
- [x] Create test account:
  - Email: `demo@pastforward.app`
  - Password: `DemoPassword123!`
- [x] Create 2-3 sample projects
- [x] Add 5-10 pages with photos
- [ ] Let AI process them
- [ ] Verify extracted text looks good

## Phase 5: Test Everything (10 minutes)

### Backend Test
- [ ] Visit: https://capstone-backend-og2c.onrender.com/health
- [ ] Should see: `{"status":"OK",...}`
- [ ] Check logs for: "AI Service initialized with default provider: google_vision"

### Web App Test
- [ ] Sign up with new account
- [ ] Sign in with test account
- [ ] View projects
- [ ] Edit project details
- [ ] View pages and extracted text
- [ ] Delete a page
- [ ] Export a PDF
- [ ] Toggle dark/light mode
- [ ] All features work except camera (expected)

### Mobile Test (if using Expo Go)
- [ ] Open app in Expo Go
- [ ] Create new project
- [ ] Take photo with camera
- [ ] Verify photo saves
- [ ] Wait for AI processing
- [ ] Check extracted text appears
- [ ] Export PDF

## Phase 6: Prepare Testing Materials (5 minutes)

- [ ] Create testing instructions document
- [ ] List what you want testers to focus on
- [ ] Include test account credentials
- [ ] Include web app URL
- [ ] (Optional) Create survey/feedback form

### Sample Testing Instructions:

```
🎓 PastForward User Testing

Thank you for testing my capstone project!

WEB VERSION (Desktop/Laptop):
URL: https://pastforward-testing.netlify.app

Test Account:
Email: demo@pastforward.app
Password: DemoPassword123!

Note: Camera doesn't work on web - use the test account to see existing projects.

MOBILE VERSION (iPhone/Android):
1. Install "Expo Go" from App Store/Play Store
2. Open this link on your phone: [your expo link]
3. Create your own account or use the test account above

WHAT TO TEST:
- Create/edit/delete projects
- View extracted text from pages
- Export projects to PDF
- Overall user experience
- Any bugs or confusing parts

FEEDBACK:
Please share your thoughts on:
1. Was it easy to use?
2. Did anything confuse you?
3. What would make it better?
4. Any bugs you found?

Send feedback to: [your email]

Thank you! 🙏
```

## Phase 7: Launch! (When ready)

- [ ] Share web link with 2-3 close friends first
- [ ] Fix any critical bugs they find
- [ ] Share with broader group of testers
- [ ] Collect feedback
- [ ] Make improvements
- [ ] Repeat!

---

## 📊 Progress Tracking

**Setup Completed:**
- ✅ Google Vision API installed
- ✅ Backend code updated
- ✅ Environment variables documented
- ✅ CORS configured for web deployment
- ✅ Web build configuration verified

**You Need To Do:**
- ⏳ Get Google Cloud API key
- ⏳ Add API key to Render
- ⏳ Build and deploy web frontend
- ⏳ Create test account
- ⏳ Share with testers

---

## 🆘 Quick Help

**Stuck on Google Cloud setup?**
→ See `GOOGLE_VISION_SETUP.md`

**Stuck on web deployment?**
→ See `WEB_DEPLOYMENT_QUICKSTART.md`

**Want to understand everything?**
→ See `USER_TESTING_DEPLOYMENT_GUIDE.md`

**Just want the summary?**
→ See `DEPLOYMENT_SUMMARY.md`

---

## ✅ You're Done When...

- ✅ Backend has Google Vision API key
- ✅ Web app is accessible via URL
- ✅ Test account exists with sample data
- ✅ You can sign in and use all features
- ✅ You're ready to share with testers!

**Estimated Total Time: ~30 minutes**

Good luck! 🍀

