# Vercel Deployment Guide for Uber Frontend

## Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub/GitLab/Bitbucket account (to connect your repository)
- Your project pushed to a Git repository

## Step-by-Step Deployment Instructions

### Method 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Prepare Your Repository
1. Make sure your code is pushed to GitHub, GitLab, or Bitbucket
2. Ensure all dependencies are in `package.json`

#### Step 2: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on **"Add New..."** → **"Project"**
3. Import your Git repository containing the Uber frontend
4. Select the repository and click **"Import"**

#### Step 3: Configure Project Settings
Vercel will auto-detect your Vite project. Verify these settings:

- **Framework Preset:** Vite
- **Root Directory:** `uberfrontend` (or leave blank if at root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Step 4: Set Environment Variables
Before deploying, add these environment variables in Vercel:

1. Click on **"Environment Variables"** section
2. Add the following variables:

   - **Name:** `VITE_GOOGLE_CLIENT_ID`
     **Value:** Your Google OAuth Client ID
   
   - **Name:** `VITE_API_BASE_URL`
     **Value:** Your backend API URL (e.g., `https://your-api-domain.com`)
     - ⚠️ **Important:** Replace `localhost:5000` with your production API URL

3. Make sure to select **Production**, **Preview**, and **Development** environments

#### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be live at a URL like: `your-project.vercel.app`

#### Step 6: Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

### Method 2: Deploy via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Navigate to Project Directory
```bash
cd Uber-frontend/uberfrontend
```

#### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No** (or **Yes** if redeploying)
- Project name? (Press Enter for default or enter custom name)
- Directory? `./` (current directory)
- Override settings? **No**

#### Step 5: Set Environment Variables
```bash
vercel env add VITE_GOOGLE_CLIENT_ID
vercel env add VITE_API_BASE_URL
```

Enter values when prompted. Select environments (Production, Preview, Development).

#### Step 6: Deploy to Production
```bash
vercel --prod
```

---

## Important Notes

### Environment Variables Required:
- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `VITE_API_BASE_URL` - Your production backend API URL (e.g., `https://api.yourdomain.com`)

### Before Deploying:
1. ✅ Update your backend API URL in environment variables
2. ✅ Ensure your backend CORS settings allow requests from your Vercel domain
3. ✅ Test your build locally: `npm run build` and `npm run preview`
4. ✅ Update Google OAuth authorized redirect URIs to include your Vercel URL

### Common Issues:

**Issue:** Build fails
- **Solution:** Check Node.js version (should be 20.x). Vercel auto-detects from `package.json` engines field.

**Issue:** API calls fail (CORS errors)
- **Solution:** Update your backend CORS settings to include your Vercel domain

**Issue:** Google OAuth not working
- **Solution:** Add your Vercel URL to authorized redirect URIs in Google Cloud Console

**Issue:** 404 errors on routes
- **Solution:** The `vercel.json` includes rewrites to handle client-side routing

### Build Logs:
- Check build logs in Vercel dashboard if deployment fails
- Common issues: missing dependencies, build errors, environment variable issues

---

## Post-Deployment Checklist
- [ ] Test all pages and routes
- [ ] Verify API connections work
- [ ] Test Google OAuth login
- [ ] Check mobile responsiveness
- [ ] Verify environment variables are set correctly
- [ ] Update backend CORS settings
- [ ] Update Google OAuth redirect URIs

---

## Redeploying After Changes
- **Automatic:** If connected to Git, pushes to main branch trigger automatic deployments
- **Manual:** Run `vercel --prod` from CLI or use "Redeploy" in dashboard

---

## Useful Vercel Commands
```bash
vercel              # Deploy to preview
vercel --prod       # Deploy to production
vercel logs         # View deployment logs
vercel inspect      # Inspect deployment
vercel env ls       # List environment variables
vercel domains      # Manage domains
```

---

For more help, visit [Vercel Documentation](https://vercel.com/docs)
