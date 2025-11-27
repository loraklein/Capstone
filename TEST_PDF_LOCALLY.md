# 🧪 Testing PDF Export Locally

## Quick Test Steps

### 1. Start Local Backend

```bash
cd backend
npm install  # This will install Chrome via postinstall script
npm run dev  # Start the backend
```

The backend will run on `http://localhost:3001`

### 2. Point Frontend to Local Backend

**Option A: Temporarily change app.json**
Remove or comment out the `apiUrl` in `app.json`:
```json
"extra": {
  "router": {},
  "eas": {
    "projectId": "8149a6cd-369b-4055-a026-a04ad31d0100"
  }
  // "apiUrl": "https://capstone-backend-og2c.onrender.com/api"  // Comment this out
}
```

**Option B: Use environment variable**
```bash
# Don't set EXPO_PUBLIC_API_URL, it will default to localhost
npx expo start
```

### 3. Test PDF Export

1. Open your app in Expo Go
2. Sign in
3. Open a project with pages
4. Try to export PDF
5. Should work! ✅

## What This Tests

✅ **Works Locally:**
- PDF generation code
- Puppeteer launching Chrome
- HTML to PDF conversion
- File download/sharing

❌ **Won't Test (Render-Specific):**
- Cache directory paths
- Build environment differences
- Render file system restrictions

## Expected Behavior

**If it works locally:**
- Your code is correct ✅
- The issue is Render-specific (cache paths, environment)
- The logging we added will help debug on Render

**If it doesn't work locally:**
- There's a code issue we need to fix first
- Check the backend logs for errors
- Verify Chrome is installed: `npx puppeteer browsers install chrome`

## Troubleshooting Local Test

### Chrome not found locally?
```bash
cd backend
npx puppeteer browsers install chrome
```

### Backend not starting?
- Check `.env` file exists in `backend/` directory
- Verify Supabase credentials are set
- Check port 3001 is not in use

### Frontend can't connect?
- Make sure backend is running on port 3001
- Check `app.json` doesn't have `apiUrl` set (or it points to localhost)
- Restart Expo after changing `app.json`

