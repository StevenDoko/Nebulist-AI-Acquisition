# 🎨 Nebulist Platform

A comprehensive CRM and AI-powered outreach platform for artistic installation companies. Built for managing leads, generating personalized emails with AI, and streamlining the entire sales pipeline from discovery to booking.

## 🔑 Login Credentials

**Default Admin Access:**
- **Username:** `admin2` or `admin3`
- **Password:** `admin345`

Use these credentials to access the platform after setup.

## 🌟 Features

### Core Features
- **🔐 Authentication System** - Secure login with Supabase and bcrypt password hashing
- **👥 User Management** - Multi-role user system (admin, manager, staff, acquisition, operations, creative)
- **📊 CRM Dashboard** - Visual kanban board with drag-and-drop lead management
- **🤖 AI Email Generation** - Hybrid AI system using Ollama with smart template fallback
- **🔍 Lead Discovery** - Search and discover new prospects across different branches
- **📅 Event Planning** - Timeline and calendar view with event export (JSON) and detailed event modals
- **🎭 Installation Catalog** - Showcase artistic installations with detailed specs
- **📁 Media Library** - Centralized asset management system

### Technical Highlights
- **Hybrid AI System** - Ollama AI (8s timeout) + instant smart templates for optimal UX
- **Real-time Updates** - Zustand state management for reactive UI
- **Drag & Drop** - @dnd-kit for intuitive kanban board interactions
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Type Safety** - Full TypeScript implementation
- **Database Migrations** - Version-controlled schema with rollback support

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.2.6** - React framework with App Router
- **React 19.2.4** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide React** - Icon library
- **Zustand** - State management
- **@dnd-kit** - Drag and drop

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database and authentication
- **bcryptjs** - Password hashing
- **Ollama** - Local AI model for email generation

### Development
- **ESLint** - Code linting
- **tsx** - TypeScript execution for scripts
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (version 18 or newer)
   ```bash
   node --version
   ```

2. **npm** or **yarn** package manager

3. **Supabase Account** (free tier works)
   - Sign up at https://supabase.com
   - Create a new project

4. **Ollama** (optional, for AI features)
   - Download from https://ollama.ai
   - Install a model: `ollama pull qwen2.5:1.5b`
   - Verify: http://localhost:11434

## 🚀 Installation

### 1. Clone the Repository

```bash
cd D:\Project\alex\nebulist-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Ollama Configuration (optional)
OLLAMA_URL=http://localhost:11434
```

**Getting Supabase Credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and anon/public key

### 4. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run migrations in order:

**Migration 1: Create auth_users table**
```bash
# Copy content from: database/migrations/001_create_auth_users.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 2: Add email and role columns**
```bash
# Copy content from: database/migrations/002_add_email_role_to_auth_users.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 3: Update admin passwords**
```bash
# Copy content from: database/migrations/003_update_admin2_admin3_password.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 4: Add department column**
```bash
# Copy content from: database/migrations/004_add_department_to_auth_users.sql
# Paste and execute in Supabase SQL Editor
```

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Verify Database Setup

Run this query in Supabase SQL Editor to verify:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'auth_users' 
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid)
- username (text)
- password_hash (text)
- full_name (text)
- is_active (boolean)
- email (text)
- role (text)
- department (text)
- last_login (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

### 6. Default Admin Accounts

After running migrations, you'll have these admin accounts:

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | Nebulist2024! | admin | admin@nebulist.local |
| admin2 | admin345 | admin | admin2@nebulist.local |
| admin3 | admin345 | admin | admin3@nebulist.local |

## 🎯 Running the Application

### Development Mode

**Option 1: Using Shortcut (Windows)**
```bash
# Double-click START-NEBULIST.bat
# This will automatically:
# - Check Ollama status
# - Start dev server
# - Open browser to http://localhost:3000
```

**Option 2: Manual Start**
```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
nebulist-platform/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   │   ├── login/       # POST /api/auth/login
│   │   │   ├── logout/      # POST /api/auth/logout
│   │   │   ├── me/          # GET /api/auth/me
│   │   │   └── profile/     # PUT /api/auth/profile
│   │   ├── generate-email/  # POST /api/generate-email
│   │   └── users/           # User management CRUD
│   ├── admin/               # Admin pages
│   ├── crm/                 # CRM kanban board
│   ├── discovery/           # Lead discovery
│   ├── outreach/            # AI email generation
│   ├── planning/            # Event calendar
│   ├── installations/       # Installation catalog
│   └── media/               # Media library
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── ...                  # Feature components
├── contexts/                # React contexts
├── database/                # Database files
│   └── migrations/          # SQL migration files
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── auth.ts             # Authentication logic
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Helper functions
├── store/                   # Zustand stores
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── .env.local              # Environment variables (create this)
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
└── tailwind.config.ts      # Tailwind CSS config
```

## 🔌 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### AI Features
- `POST /api/generate-email` - Generate personalized email with AI

## 🎨 Key Features Explained

### 1. Hybrid AI Email Generation

The platform uses a dual-mode system for optimal user experience:

**Mode 1: Ollama AI (Real AI)**
- Uses `qwen2.5:1.5b` model for fast generation
- 8-second timeout to maintain responsiveness
- Natural, varied, contextual emails
- Metadata: `mode: "ollama"`

**Mode 2: Smart Templates (Instant Fallback)**
- Activates if Ollama is unavailable or times out
- High-quality templates with full personalization
- Instant response (<1 second)
- Metadata: `mode: "fallback"`

### 2. CRM Pipeline Stages

- **Cold** - Initial contact, not yet engaged
- **Warm** - Engaged, showing interest
- **Reservation** - Committed, pending confirmation
- **Booked** - Confirmed and scheduled

### 3. Branch-Specific Strategies

Each branch has tailored outreach strategies:
- **Festivals** - Focus on immersive experiences
- **Schools** - Educational and interactive installations
- **Weddings** - Elegant and romantic setups
- **Night Clubs** - High-energy, cutting-edge designs

## 🧪 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Clear database (development only)
npm run clear

# Seed database with sample data
npm run seed
```

## 🔧 Configuration

### Ollama Setup (Optional)

If you want to use AI email generation:

```bash
# Install Ollama from https://ollama.ai

# Pull a model (recommended: qwen2.5:1.5b for speed)
ollama pull qwen2.5:1.5b

# Or use other models
ollama pull llama3.2
ollama pull phi3

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

### Supabase Row Level Security (RLS)

The migrations automatically set up RLS policies:
- Service role has full access
- Authenticated users can view active users
- Users can update their own records

## 🐛 Troubleshooting

### Issue: "Cannot connect to Supabase"
**Solution:**
1. Verify `.env.local` has correct credentials
2. Check Supabase project is active
3. Ensure anon key is correct (not service role key)

### Issue: "Ollama timeout"
**Solution:**
1. Check Ollama is running: `curl http://localhost:11434/api/tags`
2. Pull the model: `ollama pull qwen2.5:1.5b`
3. Platform will use smart templates as fallback

### Issue: "Login fails"
**Solution:**
1. Verify database migrations ran successfully
2. Check admin accounts exist in Supabase dashboard
3. Ensure passwords match migration file

### Issue: "Build fails with webpack error"
**Solution:**
- Always use `--webpack` flag: `npm run dev --webpack`
- Turbopack doesn't support WASM bindings (bcryptjs)

### Issue: "Department field is null"
**Solution:**
- Run migration 004: `004_add_department_to_auth_users.sql`
- This adds the department column to existing users

## 📊 Database Schema

### auth_users Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| username | TEXT | NO | Unique username (3-50 chars) |
| password_hash | TEXT | NO | Bcrypt hashed password |
| full_name | TEXT | NO | User's full name |
| email | TEXT | NO | Unique email address |
| role | TEXT | NO | User role (admin, manager, staff, etc.) |
| department | TEXT | YES | User's department |
| is_active | BOOLEAN | NO | Account status (default: true) |
| last_login | TIMESTAMP | YES | Last login timestamp |
| created_at | TIMESTAMP | NO | Account creation time |
| updated_at | TIMESTAMP | NO | Last update time (auto-updated) |

**Indexes:**
- `idx_auth_users_username` - Fast login lookups
- `idx_auth_users_email` - Email searches
- `idx_auth_users_is_active` - Active user filtering
- `idx_auth_users_department` - Department filtering
- `idx_auth_users_created_at` - Sorting by creation date

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Row Level Security** - Supabase RLS policies
- **Session Management** - Secure session tokens
- **Input Validation** - Username and email format checks
- **SQL Injection Protection** - Parameterized queries via Supabase
- **Environment Variables** - Sensitive data in .env.local

## 🎯 Workflow Example

1. **Login** → Use credentials (username: `admin2`, password: `admin345`)
2. **Lead Discovery** → Search for prospects (e.g., "Lowlands Festival")
3. **Add to CRM** → Click "Add to CRM" to create lead
4. **Generate Email** → Go to AI Outreach, select lead and branch
5. **Review & Send** → Review AI-generated email
6. **Track Progress** → Drag lead through pipeline stages in CRM
7. **Schedule Event** → Move to Planning when booked
8. **View Event Details** → Click "View Details" to see full event information
9. **Export Event** → Click "Export" to download event data as JSON

## 📝 Notes

- **Windows Users**: Always use `--webpack` flag (Turbopack not supported)
- **PowerShell**: Use `;` for command chaining, not `&&`
- **Port**: Default is 3000, ensure it's not in use
- **Ollama**: Optional but recommended for best AI experience
- **Database**: Supabase free tier is sufficient for development

## 🤝 Contributing

This is a hackathon project built in 72 hours. Contributions are welcome!

## 📄 License

Private project for Nebulist Platform.

## 🆘 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Verify Supabase connection
4. Check Ollama status if using AI features
5. Review migration logs in Supabase dashboard

---

**Built with ❤️ for Nebulist - Transforming Events into Unforgettable Experiences**
