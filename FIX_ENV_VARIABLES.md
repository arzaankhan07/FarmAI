# 🔧 FIX: Missing Supabase Environment Variables Error

## The Error You're Seeing
```
Uncaught Error: Missing Supabase environment variables
```

## What This Means
Your app is looking for two environment variables but can't find them in Vercel.

## Quick Fix (5 Minutes)

### Step 1: Get Your Supabase Keys

1. Go to **https://supabase.com** and log in
2. Click on your **FarmAI project**
3. Click **Settings** (left sidebar, gear icon ⚙️)
4. Click **API**
5. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 2: Add to Vercel

1. Go to **https://vercel.com** and log in
2. Click on your **FarmAI** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add the first variable:
   - Click **"Add New"** or **"+"** button
   - **Key**: `VITE_SUPABASE_URL` (must be exactly this!)
   - **Value**: Paste your Supabase Project URL
   - ✅ Check: Production, Preview, Development (all three!)
   - Click **Save**
6. Add the second variable:
   - Click **"Add New"** or **"+"** button again
   - **Key**: `VITE_SUPABASE_ANON_KEY` (must be exactly this!)
   - **Value**: Paste your Supabase anon key
   - ✅ Check: Production, Preview, Development (all three!)
   - Click **Save**

### Step 3: Redeploy

**IMPORTANT**: After adding environment variables, you MUST redeploy!

1. Go to **Deployments** tab (top menu)
2. Find your latest deployment
3. Click the **"..."** menu (three dots) on the right
4. Click **"Redeploy"**
5. Wait 1-2 minutes for it to rebuild
6. Click **"Visit"** to test your site

## Verify It's Fixed

After redeploying:
1. Visit your site
2. Press **F12** to open browser console
3. If you see the error again, check:
   - Variable names are EXACTLY: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - All three environments are checked (Production, Preview, Development)
   - You clicked "Redeploy" after adding them

## Common Mistakes

❌ **Wrong variable name**: `SUPABASE_URL` instead of `VITE_SUPABASE_URL`
❌ **Only checked Production**: Need to check all three environments
❌ **Forgot to redeploy**: Must redeploy after adding variables
❌ **Typo in variable name**: Must be exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## Still Not Working?

1. Double-check variable names are EXACTLY correct (case-sensitive!)
2. Make sure you redeployed after adding them
3. Check Vercel logs: Deployments → Click deployment → View Function Logs
4. Verify Supabase project is active (not paused)

