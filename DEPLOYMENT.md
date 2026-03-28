# TubeIntel Deployment Guide

## Vercel Deployment Setup

This guide walks you through deploying TubeIntel to Vercel with automated CI/CD.

### Prerequisites
- GitHub account with repository access
- Vercel account (free tier is sufficient)
- Node.js 18+ installed locally

---

## Step 1: Initial Vercel Deployment

### Option A: Using Vercel Web Dashboard (Recommended for first-time)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click **Add New** → **Project**
   - Select **Tubeintel-40k** repository
   - Vercel auto-detects Vite configuration
   - Click **Deploy**

3. **Get Deployment Tokens** (for GitHub Actions)
   - Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - Create token with name "GitHub Actions"
   - Copy the token

### Option B: Using Vercel CLI

```powershell
npm install -g vercel
vercel link
vercel deploy --prod
```

---

## Step 2: Set Up GitHub Actions CI/CD

### 2.1 Add Vercel Secrets to GitHub

1. Go to **GitHub** → **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:
   - **VERCEL_TOKEN**: Paste the token from Step 1.3
   - **VERCEL_ORG_ID**: Get from Vercel dashboard
     - Dashboard → Settings → General → Team ID
   - **VERCEL_PROJECT_ID**: Get from Vercel dashboard
     - Dashboard → Settings → General → Project ID

### 2.2 Verify GitHub Actions Workflow

The workflow file (`.github/workflows/deploy.yml`) will:
- Trigger on **master branch push** or **pull request**
- Install dependencies
- Build the Vite project
- Deploy to Vercel automatically

---

## Step 3: Environment Variables Setup

### For Development (`.env.local`)
```
VITE_YOUTUBE_API_KEY=your_api_key_here
```

### For Production (Vercel Dashboard)

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Add `VITE_YOUTUBE_API_KEY` with your YouTube API key
3. Select environments: **Production, Preview, Development**

**Get YouTube API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable **YouTube Data API v3**
4. Create API key (Credentials → Create Credentials → API Key)
5. Add to Vercel environment variables

---

## Step 4: Deploy & Monitor

### First Deployment
```powershell
git add .
git commit -m "Add Vercel and GitHub Actions configuration"
git push origin master
```

GitHub Actions will automatically:
1. Build the project
2. Run tests (if configured)
3. Deploy to Vercel on success

### Monitor Deployments
- **GitHub**: Actions tab → Deploy to Vercel workflow
- **Vercel**: Dashboard → Deployments tab
- **Live URL**: https://tubeintel-40k.vercel.app

---

## Step 5: Automatic Preview Deployments

GitHub Actions is configured to:
- **Preview deploy** on every pull request
- **Production deploy** only on master branch push

This means:
- Create PR → Vercel creates preview URL automatically
- Get feedback on staging before merging
- Merge to master → Live production deployment

---

## Configuration Files Explained

### `vercel.json`
- **buildCommand**: How to build (npm run build)
- **outputDirectory**: Where built files go (dist)
- **headers**: Security headers & caching rules
- **rewrites**: SPA routing (all routes → index.html)
- **env**: Environment variable definitions

### `.github/workflows/deploy.yml`
- **Trigger**: Runs on push to master or PR creation
- **Steps**:
  1. Check out code
  2. Setup Node 18
  3. Install dependencies
  4. Build Vite project
  5. Deploy to Vercel using auth tokens

---

## Troubleshooting

### GitHub Actions Failing
**Problem**: `Error: Missing Vercel credentials`
- **Solution**: Check VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID in GitHub Secrets

### Build Failing
**Problem**: `npm run build` fails
- **Solution**: 
  - Run locally: `npm install && npm run build`
  - Check for missing dependencies
  - Verify API key environment variable

### Environment Variables Not Loading
**Problem**: `process.env.VITE_YOUTUBE_API_KEY` is undefined
- **Solution**:
  - Must prefix with `VITE_` (Vite requirement)
  - Restart dev server after adding `.env.local`
  - In code: `import.meta.env.VITE_YOUTUBE_API_KEY`

### SPA Routing Issues
**Problem**: Page refreshes go to 404
- **Solution**: `vercel.json` rewrites handle this
  - All routes → `/index.html`
  - React Router handles client-side routing

---

## Performance & Security

### Caching Strategy (from vercel.json)
- **Static assets** (.js, .css, images): 1 year cache
- **HTML files**: No cache (must-revalidate)
- **Security headers**: XSS, clickjacking, type-sniffing protection

### Build Optimization
- Vite handles tree-shaking & minification
- React lazy loading for modals
- Recharts built-in optimization

---

## Next Steps

1. ✅ Commit all changes:
   ```powershell
   git add .
   git commit -m "Add Vercel & GitHub Actions deployment"
   git push origin master
   ```

2. ✅ Monitor first deployment in GitHub Actions

3. ✅ Visit `https://tubeintel-40k.vercel.app`

4. ✅ Share with team/stakeholders

---

## Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [GitHub Actions for Vercel](https://github.com/vercel/action)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)

---

**Questions?** Check Vercel & GitHub Actions logs for detailed error messages.
