# 🚀 Vercel Deployment Guide for TemSafy Pro

## Step-by-Step Deployment Process

### 1. Initial Vercel Setup

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "New Project"
   - Find and select `Odiway/temsa-pro` from your GitHub repositories
   - Click "Import"

### 2. Project Configuration

**Framework Preset**: Next.js (should be auto-detected)
**Root Directory**: `./` (leave as default)
**Build Command**: `npm run build` (auto-configured)
**Output Directory**: `.next` (auto-configured)

### 3. Environment Variables Setup

Add these environment variables in Vercel project settings:

#### Required Variables:
```env
# Database (use Vercel Postgres or external PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require

# NextAuth Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-super-secure-secret-key-minimum-32-characters

# Environment
NODE_ENV=production
```

### 4. Database Setup Options

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Click "Connect Database" → "Postgres"
4. Create a new database
5. Copy the connection string to `DATABASE_URL`

#### Option B: External PostgreSQL
Use any PostgreSQL provider:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app
- **PlanetScale**: https://planetscale.com

### 5. Build Settings

Vercel will automatically:
- Run `npm install` to install dependencies
- Execute `npm run build` which includes:
  - `prisma generate` - Generate Prisma client
  - `next build` - Build the Next.js application
- Apply database schema with Prisma

### 6. Deployment Process

1. **Configure Variables**: Set all environment variables
2. **Deploy**: Click "Deploy" button
3. **Wait**: Build process takes 2-5 minutes
4. **Access**: Your app will be available at `https://your-app-name.vercel.app`

### 7. Post-Deployment Setup

#### Database Migration
After first deployment, run database migration:
1. Go to Vercel project → Functions tab
2. Or use Vercel CLI to run: `vercel exec -- npx prisma db push`

#### Seed Database (Optional)
To add test data:
1. Use Vercel CLI: `vercel exec -- npm run db:seed`
2. Or manually create users through the application

### 8. Custom Domain (Optional)

1. Go to project settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` to use your custom domain

## Environment Variables Reference

### Production Environment Template:
```env
# Database - Replace with your actual database URL
DATABASE_URL="postgresql://user:pass@host:5432/temsa_pro?sslmode=require"

# NextAuth - Replace with your actual domain
NEXTAUTH_URL="https://your-app.vercel.app"

# Secret - Generate a secure secret (32+ characters)
NEXTAUTH_SECRET="your-production-secret-key-change-this"

# Environment
NODE_ENV="production"
```

### Generate Secure Secret:
```bash
# Use this command to generate a secure secret
openssl rand -base64 32
```

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check environment variables are set
2. **Database Connection**: Verify DATABASE_URL format
3. **Authentication Issues**: Ensure NEXTAUTH_URL matches your domain
4. **Prisma Errors**: Database schema needs to be applied

### Build Logs:
Check Vercel Functions tab for detailed error logs if deployment fails.

## Success Checklist

- ✅ Repository imported to Vercel
- ✅ Environment variables configured
- ✅ Database connected and accessible
- ✅ Build completed successfully
- ✅ Application accessible at Vercel URL
- ✅ Authentication working
- ✅ Database operations functional

## Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test database connection
4. Review application logs in Vercel Functions tab
