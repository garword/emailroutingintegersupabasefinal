# 🚀 Deploying to Vercel

This guide will walk you through deploying the Email Routing Manager to Vercel's free tier.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. ✅ **Supabase Project** set up and configured
2. ✅ **Database Schema** applied (run `supabase-schema.sql` in your Supabase SQL Editor)
3. ✅ **GitHub Repository** with your code pushed
4. ✅ **Vercel Account** (free tier is sufficient)

## Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: Email Routing Manager
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 1.2 Apply Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste into the SQL Editor
5. Click **Run** to execute the schema
6. Verify tables were created in **Table Editor**

### 1.3 Get Supabase Credentials

You'll need three values from your Supabase project:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) ⚠️ Keep this secret!

## Step 2: Deploy to Vercel

### 2.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 2.2 Configure Environment Variables

Before deploying, add these environment variables in Vercel:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGc...` |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key | `eyJhbGc...` |

**To add environment variables:**
1. In Vercel project settings, go to **Environment Variables**
2. Add each variable above
3. Set environment to **Production**, **Preview**, and **Development**

> [!CAUTION]
> Never commit `SUPABASE_SERVICE_KEY` to your repository! Only add it in Vercel's environment variables.

### 2.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, click **Visit** to see your live site

## Step 3: Post-Deployment Configuration

### 3.1 Configure Cloudflare Settings

1. Visit your deployed site
2. Login with credentials: `windaa` / `cantik`
3. Go to **Config** page
4. Enter your Cloudflare API credentials:
   - API Token
   - Account ID
   - Destination emails

### 3.2 Test Email Routing

1. Go to **Dashboard**
2. Try creating a new email routing rule
3. Verify it appears in your Cloudflare dashboard
4. Check Supabase **Table Editor** to confirm data is saved

## Troubleshooting

### Build Fails

**Error: "Cannot find module '@prisma/client'"**
- This is expected if Prisma generation fails
- The app uses Supabase, not Prisma
- Ensure `DATABASE_URL` environment variable is set

**Error: "ENOENT: no such file or directory"**
- Check that all file paths are correct
- Ensure no hardcoded file system paths exist

### Runtime Errors

**Error: "Supabase client error"**
- Verify all three Supabase environment variables are set correctly
- Check that your Supabase project is active
- Ensure database schema has been applied

**Error: "Failed to fetch zones"**
- Check Cloudflare API token is valid
- Verify token has correct permissions: `Zone:Read`, `Email Routing Rules:Edit`

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is correct
- Check Supabase project is not paused (free tier pauses after 7 days of inactivity)
- Ensure database password is correct in connection string

### Performance Issues

**Slow API responses**
- Vercel free tier has cold starts (~1-2 seconds)
- First request after inactivity will be slower
- Subsequent requests will be faster

## Environment Variables Reference

Create a `.env.local` file for local development:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Then fill in your actual values:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="your-actual-anon-key"
SUPABASE_SERVICE_KEY="your-actual-service-key"
```

## Vercel Configuration

The project includes a `vercel.json` file with optimized settings:

- **Region**: Singapore (sin1) - change if needed
- **Function timeout**: 10 seconds for API routes
- **Framework**: Next.js auto-detected

To change the region, edit `vercel.json`:
```json
{
  "regions": ["sin1"]  // Change to your preferred region
}
```

Available regions: `sin1` (Singapore), `hnd1` (Tokyo), `sfo1` (San Francisco), `iad1` (Washington DC), etc.

## Monitoring

### View Logs

1. Go to your Vercel project dashboard
2. Click **Deployments** → Select your deployment
3. Click **Functions** to see API route logs
4. Check for errors or warnings

### Database Monitoring

1. Go to Supabase dashboard
2. Click **Database** → **Logs**
3. Monitor queries and errors

## Updating Your Deployment

To deploy updates:

1. Push changes to your GitHub repository
2. Vercel will automatically deploy
3. Monitor deployment progress in Vercel dashboard

## Cost Considerations

**Vercel Free Tier Limits:**
- 100 GB bandwidth per month
- 100 hours of serverless function execution
- Unlimited deployments

**Supabase Free Tier Limits:**
- 500 MB database space
- 2 GB bandwidth per month
- Pauses after 7 days of inactivity (can be reactivated)

Both are sufficient for personal use and small-scale deployments.

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Configure Cloudflare Email Routing
3. ✅ Create your first email alias
4. ✅ Monitor usage in Vercel and Supabase dashboards

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify all environment variables are set correctly
4. Ensure database schema is applied
5. Test Cloudflare API credentials

---

**Happy Deploying! 🎉**
