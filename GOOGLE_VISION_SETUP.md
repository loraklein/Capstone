# Google Cloud Vision API Setup Guide

## Step 1: Create Google Cloud Account & Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Gmail account

2. **Create a New Project**
   - Click the project dropdown at the top (next to "Google Cloud")
   - Click "NEW PROJECT"
   - Name it: `PastForward` (or whatever you prefer)
   - Click "CREATE"
   - Wait a few seconds for it to be created
   - **Make sure the new project is selected** in the dropdown

## Step 2: Enable Vision API

1. **Navigate to Vision API**
   - In the search bar at top, type: `Vision API`
   - Click on "Cloud Vision API"
   - Click the blue "ENABLE" button
   - Wait for it to enable (takes ~30 seconds)

## Step 3: Set Up Billing (Required for API key)

⚠️ **Note:** You need a credit card, but you won't be charged unless you exceed 1,000 requests/month

1. Click "Billing" in the left sidebar (or search for it)
2. Click "LINK A BILLING ACCOUNT"
3. Follow the prompts to add your credit card
4. **Set up a Budget Alert** (recommended):
   - Go to "Billing" → "Budgets & alerts"
   - Click "CREATE BUDGET"
   - Set amount: $10
   - This will email you if you somehow go over

## Step 4: Create API Key

1. **Go to Credentials**
   - Search for "Credentials" or find it in the left menu under "APIs & Services"
   - Click "Credentials"

2. **Create API Key**
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API key"
   - A dialog will show your new API key - **COPY IT NOW**
   - It will look like: `AIzaSyD...` (about 39 characters)

3. **Restrict the API Key** (Security best practice)
   - Click "RESTRICT KEY" in the dialog (or click the key name to edit)
   - Under "API restrictions":
     - Select "Restrict key"
     - In the dropdown, find and check ✅ "Cloud Vision API"
   - Click "SAVE"

## Step 5: Add to Your Backend (Render)

1. **Go to your Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Click on your backend service

2. **Add Environment Variable**
   - Go to "Environment" tab
   - Click "Add Environment Variable"
   - Key: `GOOGLE_CLOUD_API_KEY`
   - Value: [paste your API key]
   - Click "Save Changes"
   - **Your backend will auto-redeploy** (takes ~2-3 minutes)

## Step 6: Test It!

Once the backend redeploys, the Vision API will be your default provider.

You can verify it's working by:
1. Uploading a photo through your app
2. Check your backend logs on Render
3. You should see "Successfully processed page X with google_vision"

---

## Cost Monitoring

- **Check usage**: https://console.cloud.google.com/apis/dashboard
- **Check billing**: https://console.cloud.google.com/billing

## Troubleshooting

**"API key not valid" error:**
- Make sure you enabled the Vision API
- Check that the API key has Vision API in its restrictions
- Verify the key was copied correctly (no extra spaces)

**"Billing not enabled" error:**
- Go back to Step 3 and set up billing
- It can take a few minutes to propagate

---

**Next Steps:** After you get your API key, let me know and I'll help you add it to Render!

