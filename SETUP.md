# Quick Setup Guide for TemSafy Pro

## 🚀 Quick Start for Development

### Prerequisites
1. **Node.js 18+** installed
2. **PostgreSQL database** (local or cloud)
3. **VS Code** (recommended)

### 1. Database Setup
You have several options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL if not installed
# Create a database named 'field_task_manager'
createdb field_task_manager
```

#### Option B: Use Vercel Postgres (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection strings

#### Option C: Use any PostgreSQL service
- Neon, Supabase, Railway, or any other PostgreSQL provider

### 2. Environment Configuration
Update your `.env.local` file with your database credentials:

```env
# Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/field_task_manager"
POSTGRES_DATABASE_URL="postgresql://username:password@localhost:5432/field_task_manager"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-very-secret-key-change-this-in-production"
NODE_ENV="development"
```

### 3. Database Setup
```bash
# Push the schema to your database
npx prisma db push

# Seed the database with sample data
npx prisma db seed
```

### 4. Start Development
```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Test Login Credentials

After seeding, you can login with these accounts:

- **Admin**: admin@temsafy.com / 123456
- **Manager**: manager@temsafy.com / 123456
- **Department**: department@temsafy.com / 123456
- **Field**: field@temsafy.com / 123456

## 🛠 VS Code Tasks

This project includes VS Code tasks for common operations:
- **Start Development Server** - Runs `npm run dev`

## 📊 Database Management

```bash
# View your data in Prisma Studio
npx prisma studio

# Reset database (careful in production!)
npx prisma db push --force-reset

# Generate Prisma client after schema changes
npx prisma generate
```

## 🚀 Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard
4. **Deploy**

After deployment:
```bash
# Push schema to production database
npx prisma db push

# Seed production database
npx prisma db seed
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check your DATABASE_URL format
- Ensure PostgreSQL is running
- Verify credentials and database exists

### Build Issues
- Run `npm install` to ensure all dependencies
- Run `npx prisma generate` after schema changes
- Check Node.js version (requires 18+)

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma studio    # Open database GUI
npx prisma db push   # Apply schema changes
npx prisma db seed   # Seed database

# Linting
npm run lint         # Check code quality
```

## 📱 Features Available

### ✅ Implemented
- User authentication with role-based access
- Dashboard layouts for all user roles
- Basic task management structure
- Database schema and API routes
- Responsive UI with Tailwind CSS

### 🚧 Ready for Extension
- Advanced analytics (charts ready)
- Real-time notifications
- Calendar integration
- File uploads
- Advanced reporting
- Mobile app support

## 🎯 Next Steps

1. **Configure your database** and update .env.local
2. **Run the seeding** to get sample data
3. **Start development** and explore the dashboards
4. **Customize** the components for your needs
5. **Deploy** to Vercel when ready

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review the project structure in /src
- Examine the database schema in /prisma/schema.prisma
- Look at the API routes in /src/app/api

Happy coding! 🚀
