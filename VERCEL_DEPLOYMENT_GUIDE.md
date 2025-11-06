# How to Deploy Your FarmAI Project to Vercel

## What Was the Problem?

Your project wasn't deploying on Vercel because:
1. ❌ Missing configuration file (`vercel.json`) - Vercel didn't know how to build your project
2. ❌ Missing environment variables - Your app needs Supabase credentials to work

## What We Fixed

✅ Created `vercel.json` - This tells Vercel:
   - How to build your project (`npm run build`)
   - Where to find the built files (`dist` folder)
   - How to handle page routing

## What You Need to Do Now

### Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project (or create one if you don't have it)
3. Go to **Settings** → **API**
4. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

**Copy both of these - you'll need them in Step 2!**

### Step 2: Add Environment Variables to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Find your **FarmAI** project (or import it from GitHub if you haven't)
3. Click on your project
4. Click **Settings** (top menu)
5. Click **Environment Variables** (left sidebar)
6. Add these two variables:

   **First Variable:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Paste your Supabase Project URL (from Step 1)
   - Environments: Check all boxes (Production, Preview, Development)
   - Click **Save**

   **Second Variable:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Paste your Supabase anon key (from Step 1)
   - Environments: Check all boxes (Production, Preview, Development)
   - Click **Save**

### Step 3: Deploy

After adding the environment variables:

1. Go to the **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Click **Redeploy**
4. Or: Vercel will automatically redeploy when you push to GitHub

### Step 4: Check if It Works

1. Wait for the deployment to finish (you'll see a green checkmark)
2. Click on the deployment
3. Click **Visit** to see your live site
4. If you see errors, check the **Logs** tab to see what went wrong

## Common Issues

### Issue: "Missing Supabase environment variables" error
**Solution:** Make sure you added both environment variables in Vercel and selected all environments (Production, Preview, Development)

### Issue: Build fails
**Solution:** Check the build logs in Vercel. Common causes:
- Missing dependencies (should be fixed automatically)
- TypeScript errors (check your code)

### Issue: Site loads but shows blank page
**Solution:** 
- Check browser console for errors (F12 → Console tab)
- Make sure environment variables are set correctly
- Check that your Supabase project is active

## Quick Checklist

Before deploying, make sure:
- [ ] `vercel.json` file exists in your project ✅ (We already did this)
- [ ] Environment variables are set in Vercel
- [ ] Supabase project is created and active
- [ ] You've run the database migration in Supabase
- [ ] You've deployed Supabase Edge Functions (if needed)

## Need Help?

If something still doesn't work:
1. Check the Vercel deployment logs
2. Check your browser console (F12)
3. Make sure your Supabase project is set up correctly
4. Verify environment variable names match exactly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)

