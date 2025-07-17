# TemSafy Pro - Field Team Management System

A comprehensive field team management system built with Next.js 14, featuring role-based dashboards, task management, real-time analytics, and calendar scheduling. Optimized for Vercel deployment with PostgreSQL and Prisma.

## 🚀 Features

### Core Functionality
- **Role-Based Access Control**: ADMIN, MANAGER, DEPARTMENT, and FIELD user roles
- **Task Management**: Hierarchical projects → tasks → phases structure
- **Real-Time Analytics**: Performance metrics and KPIs
- **Calendar System**: Schedule management and deadline tracking
- **User Management**: Team assignment and workload balancing
- **Responsive Design**: Mobile-friendly interface

### Role-Specific Dashboards
- **Manager Dashboard**: Project overview, team management, analytics
- **Department Dashboard**: Team workload, department tasks, performance metrics
- **Field Dashboard**: Assigned phases, progress tracking, time logging

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Vercel Postgres)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v4 with JWT
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: react-hook-form + zod validation
- **State Management**: Zustand + React hooks
- **Notifications**: react-hot-toast
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Vercel Postgres)
- npm or yarn

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd field-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/field_task_manager"
   POSTGRES_DATABASE_URL="postgresql://username:password@localhost:5432/field_task_manager"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Application
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed database with sample data
   npx prisma db seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🚀 Vercel Deployment

### 1. Database Setup
- Create a Vercel Postgres database
- Copy the connection string

### 2. Environment Variables
Set these in Vercel dashboard:
```env
DATABASE_URL=your_vercel_postgres_url
POSTGRES_DATABASE_URL=your_vercel_postgres_direct_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production
```

### 3. Deploy
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`
   - **Framework**: Next.js
3. Deploy and verify functionality

### 4. Post-Deployment
```bash
# Push database schema
npx prisma db push

# Seed database
npx prisma db seed
```

## 🔐 Test Credentials

After seeding, use these credentials to test different roles:

- **Admin**: admin@temsafy.com / 123456
- **Manager**: manager@temsafy.com / 123456
- **Department**: department@temsafy.com / 123456
- **Field**: field@temsafy.com / 123456

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/login/              # Authentication pages
│   ├── (dashboard)/               # Protected dashboard routes
│   │   ├── manager/               # Manager dashboard & features
│   │   ├── department/            # Department dashboard
│   │   └── field/                 # Field worker dashboard
│   ├── api/                       # API routes
│   │   ├── auth/                  # NextAuth configuration
│   │   ├── users/                 # User management
│   │   ├── departments/           # Department operations
│   │   ├── projects/              # Project management
│   │   ├── tasks/                 # Task operations
│   │   ├── phases/                # Phase management
│   │   └── analytics/             # Analytics data
│   └── globals.css                # Global styles
├── components/
│   ├── ui/                        # Reusable UI components
│   ├── dashboard/                 # Dashboard-specific components
│   ├── tasks/                     # Task-related components
│   └── Navigation.tsx             # Main navigation
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── database.ts                # Prisma client
│   ├── utils.ts                   # Utility functions
│   └── validations.ts             # Zod schemas
├── types/                         # TypeScript type definitions
└── hooks/                         # Custom React hooks
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users**: Authentication and role management
- **Departments**: Organizational structure
- **Projects**: High-level project management
- **Tasks**: Specific work items within projects
- **TaskPhases**: Granular work phases assigned to users
- **Notifications**: System notifications

## 🔧 API Routes

### Core Endpoints
- `GET /api/users` - List users with filtering
- `POST /api/users` - Create new user
- `GET /api/departments` - List departments
- `GET /api/projects` - List projects
- `GET /api/tasks` - List tasks
- `GET /api/analytics` - Get system metrics

### User-Specific
- `GET /api/users/me/phases` - Get user's assigned phases
- `POST /api/phases/[id]/start` - Start a task phase
- `GET /api/users/[id]/workload` - Get user workload

## 🧪 Development Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server

# Database
npm run prisma:generate        # Generate Prisma client
npm run prisma:push           # Push schema changes
npm run prisma:seed           # Seed database
npx prisma studio             # Open Prisma Studio

# Linting
npm run lint                  # Run ESLint
```

## 🔧 Configuration Files

- `vercel.json` - Vercel deployment configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `prisma/schema.prisma` - Database schema
- `tsconfig.json` - TypeScript configuration

## 📋 Features Roadmap

### Implemented ✅
- User authentication and authorization
- Role-based dashboards
- Basic task management
- Database schema and API routes
- Responsive UI design

### Coming Soon 🚧
- Real-time notifications
- Advanced analytics charts
- Calendar integration
- File upload functionality
- Advanced reporting
- Mobile app support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**TemSafy Pro** - Efficient field team management for modern organizations.
