# Deploy to Railway

This guide shows you how to deploy the LinkedIn Ad Redirect Tester to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (to connect your repository)

## Deployment Steps

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd "/Users/sanchittripathi/Desktop/Test LinkedIn Ads"
   git init
   git add .
   git commit -m "Initial commit: LinkedIn Ad Redirect Tester"
   git remote add origin https://github.com/YOUR_USERNAME/linkedin-ad-tester.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect and deploy your app

3. **Configure Environment (if needed)**
   - Railway automatically sets the PORT environment variable
   - No additional configuration needed!

4. **Access Your App**
   - Railway will provide a public URL like: `https://your-app.railway.app`
   - Click on the URL to access your tester

### Option 2: Deploy with Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   cd "/Users/sanchittripathi/Desktop/Test LinkedIn Ads"
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get URL**
   ```bash
   railway domain
   ```

## What Gets Deployed

- ✅ Web interface (accessible via browser)
- ✅ API endpoints for testing
- ✅ 15 device profiles (8 iOS + 7 Android)
- ✅ Playwright browser automation
- ✅ All testing logic

## Post-Deployment

### Test Your Deployment

Visit your Railway URL and you should see the LinkedIn Ad Redirect Tester interface.

### Usage

1. Paste your LinkedIn ad URL in the input field
2. Click "Test Redirects"
3. Watch real-time progress as it tests 15 devices
4. View detailed results showing:
   - Which devices passed/failed
   - Where each device redirected
   - Complete redirect chains
   - Response times

## Configuration

### Environment Variables (Optional)

You can set these in Railway dashboard under "Variables":

- `PORT` - Automatically set by Railway (default: 3000)
- No other variables needed!

## Troubleshooting

### Build Fails

If the build fails with Playwright errors:
1. Check the Railway build logs
2. Make sure `nixpacks.toml` is in your repo
3. Railway should automatically install Chromium dependencies

### App Crashes

If the app crashes on Railway:
1. Check the logs in Railway dashboard
2. Make sure you have enough memory (upgrade plan if needed)
3. Playwright needs ~512MB RAM minimum

### Slow Performance

Each test takes ~30-45 seconds to complete across 15 devices. This is normal.

If tests timeout:
- Upgrade Railway plan for better performance
- Tests run sequentially to avoid overwhelming the server

## Costs

Railway offers:
- **Hobby Plan**: $5/month - Perfect for this app
- **Free Trial**: $5 credit to start

This app uses minimal resources:
- ~512MB RAM during testing
- Bandwidth depends on test frequency
- CPU usage is moderate

## Security

The app is stateless and doesn't store any data permanently.
- Test results are kept in memory for 1 hour then deleted
- No database required
- No user authentication (add if needed)

## Updating Your Deployment

To update after making changes:

**With GitHub:**
```bash
git add .
git commit -m "Update: description of changes"
git push
```
Railway automatically redeploys!

**With CLI:**
```bash
railway up
```

## Custom Domain (Optional)

To use your own domain:
1. Go to Railway project settings
2. Click "Domains"
3. Add your custom domain
4. Update your DNS records as instructed

## Support

If you encounter issues:
- Check Railway logs: `railway logs`
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

---

## Quick Deploy Button

Add this to your GitHub README to enable one-click deployment:

```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/linkedin-ad-tester)
```

---

**Your app will be live and ready to test LinkedIn ad redirects from anywhere!**
