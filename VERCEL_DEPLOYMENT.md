# TemSafy Pro - Environment Variables for Vercel Deployment

## Required Environment Variables for Vercel:

### 1. DATABASE_URL
For production, you'll need a PostgreSQL database. You can use:
- Vercel Postgres (recommended)
- Neon (free tier available)
- Supabase (free tier available)
- Railway (free tier available)

Example for Vercel Postgres:
```
DATABASE_URL="postgres://username:password@hostname:port/database?sslmode=require"
```

### 2. NEXTAUTH_URL
```
NEXTAUTH_URL="https://your-vercel-app-name.vercel.app"
```

### 3. NEXTAUTH_SECRET
Generate a secure secret for production:
```
NEXTAUTH_SECRET="your-very-secure-secret-key-for-production-minimum-32-characters"
```

### 4. NODE_ENV
```
NODE_ENV="production"
```

## Deployment Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to vercel.com
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard

3. **Set up Database:**
   - Create a PostgreSQL database (Vercel Postgres recommended)
   - Update DATABASE_URL in Vercel environment variables
   - The database schema will be created automatically during deployment

4. **Environment Variables in Vercel:**
   Add these in your Vercel project settings > Environment Variables:
   - DATABASE_URL
   - NEXTAUTH_URL  
   - NEXTAUTH_SECRET
   - NODE_ENV

## Database Migration for Production:

The app will automatically:
- Generate Prisma client during build
- Apply database schema with `prisma db push`
- You can seed the database by running the seed script manually if needed

## Important Notes:

- SQLite is only for local development
- Production requires PostgreSQL
- All APIs are properly configured with authentication
- The build script includes Prisma generation
