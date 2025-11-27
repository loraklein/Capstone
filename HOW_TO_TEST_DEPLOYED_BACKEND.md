# 🎯 How to Test Deployed Backend vs Local Backend

## How Your App Chooses the Backend

Your app uses different backends based on the mode:

### Development Mode (`__DEV__ = true`)
- **When:** Running `npx expo start` or `npm start`
- **Backend:** `http://localhost:3001/api` (or your local IP)
- **Use case:** Testing local changes

### Production Mode (`__DEV__ = false`)
- **When:** Built/exported app (web build, production build)
- **Backend:** `https://capstone-backend-og2c.onrender.com/api`
- **Use case:** Testing deployed code

---

## 🔍 How to Verify Which Backend You're Using

### Method 1: Check the API Base URL (Easiest)

Add this temporary code to see which backend is being used:

**In `app/(tabs)/settings.tsx` or any screen, add:**

```typescript
import { apiService } from '../utils/apiService';
import { useEffect, useState } from 'react';

// Add this in your component:
const [backendUrl, setBackendUrl] = useState('');

useEffect(() => {
  setBackendUrl(apiService.getBaseURL());
}, []);

// Then display it:
<Text>Backend: {backendUrl}</Text>
```

### Method 2: Check Network Requests

1. **In Expo Go:**
   - Open React Native Debugger
   - Check Network tab
   - Look at API request URLs

2. **In Web Browser:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Make an API request
   - Check the request URL

### Method 3: Check Backend Logs

**If using LOCAL backend:**
- Check your local terminal where you ran `npm run dev` in the backend folder
- You'll see requests logged there

**If using DEPLOYED backend:**
- Check Render dashboard logs
- Go to: https://dashboard.render.com/ → Your service → Logs

---

## 🧪 Testing Scenarios

### Scenario 1: Test LOCAL Backend

1. **Start local backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `🚀 Server running on port 3001`

2. **Start Expo in DEV mode:**
   ```bash
   npx expo start
   ```
   - Opens in development mode
   - Will connect to `localhost:3001`

3. **Verify:**
   - Check local backend terminal for request logs
   - Make a request in the app
   - Should see logs in your local terminal

### Scenario 2: Test DEPLOYED Backend

1. **Make sure local backend is NOT running:**
   ```bash
   # Stop any local backend processes
   # Or use a different port
   ```

2. **Option A: Build for production**
   ```bash
   npx expo export --platform web
   ```
   - This creates a production build
   - Will use Render backend automatically

3. **Option B: Force production mode**
   - Set environment variable:
     ```bash
     EXPO_PUBLIC_API_URL=https://capstone-backend-og2c.onrender.com/api npx expo start
     ```

4. **Verify:**
   - Check Render dashboard logs
   - Make a request in the app
   - Should see logs in Render dashboard

---

## 🎛️ Override Backend URL (For Testing)

You can force a specific backend URL:

### Option 1: Environment Variable
```bash
EXPO_PUBLIC_API_URL=https://capstone-backend-og2c.onrender.com/api npx expo start
```

### Option 2: Modify app.json
Add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://capstone-backend-og2c.onrender.com/api"
    }
  }
}
```

### Option 3: Temporary Code Change
In `utils/apiService.ts`, temporarily hardcode:
```typescript
const API_BASE_URL = 'https://capstone-backend-og2c.onrender.com/api';
```

---

## ✅ Quick Verification Checklist

- [ ] **Local Backend:**
  - [ ] Local backend is running (`npm run dev` in backend folder)
  - [ ] Expo is in dev mode (`npx expo start`)
  - [ ] Requests appear in local backend terminal
  - [ ] API URL shows `localhost:3001` or your local IP

- [ ] **Deployed Backend:**
  - [ ] Local backend is stopped
  - [ ] Using production build OR set `EXPO_PUBLIC_API_URL`
  - [ ] Requests appear in Render dashboard logs
  - [ ] API URL shows `capstone-backend-og2c.onrender.com`

---

## 🐛 Troubleshooting

### Issue: App connects to wrong backend

**Solution:** Check `__DEV__` mode:
- Development = local backend
- Production = Render backend

### Issue: Can't tell which backend is being used

**Solution:** Add logging:
```typescript
console.log('API Base URL:', apiService.getBaseURL());
```

### Issue: Want to test deployed backend but in dev mode

**Solution:** Use environment variable:
```bash
EXPO_PUBLIC_API_URL=https://capstone-backend-og2c.onrender.com/api npx expo start
```

---

## 📝 Summary

| Mode | Command | Backend Used |
|------|---------|-------------|
| **Development** | `npx expo start` | `localhost:3001` |
| **Production** | `npx expo export --platform web` | `capstone-backend-og2c.onrender.com` |
| **Override** | `EXPO_PUBLIC_API_URL=... npx expo start` | Whatever you specify |

**To test deployed backend:** Use production build or set `EXPO_PUBLIC_API_URL` environment variable.

