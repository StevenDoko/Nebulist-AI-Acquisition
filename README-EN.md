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

**Migration 3: Insert admin users**
```bash
# Copy content from: database/migrations/003_update_admin2_admin3_password.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 4: Add department column**
```bash
# Copy content from: database/migrations/004_add_department_to_auth_users.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 5: Create installations table**
```bash
# Copy content from: database/migrations/005_create_installations_table.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 6: Create storage policies**
```bash
# Copy content from: database/migrations/006_create_storage_policies.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 7: Add soft delete to installations**
```bash
# Copy content from: database/migrations/007_add_soft_delete_to_installations.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 8: Create events table**
```bash
# Copy content from: database/migrations/008_create_events_table.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 9: Create bookings table**
```bash
# Copy content from: database/migrations/009_create_bookings_table.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 10: Create quote_requests table**
```bash
# Copy content from: database/migrations/010_create_quote_requests_table.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 11: Add more installations**
```bash
# Copy content from: database/migrations/011_add_more_installations.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 12: Add lead_id to events**
```bash
# Copy content from: database/migrations/012_add_lead_id_to_events.sql
# Paste and execute in Supabase SQL Editor
```

**Migration 13: Increase decimal precision**
```bash
# Copy content from: database/migrations/013_increase_decimal_precision.sql
# Paste and execute in Supabase SQL Editor
```

#### Option B: Using Migration Script (Advanced)

```bash
# Run all migrations at once
npm run migrate
```

### 5. Seed Sample Data (Optional)

```bash
# Add sample leads to CRM
npm run seed
```

### 6. Start Development Server

```bash
npm run dev --webpack
```

**Note:** The `--webpack` flag is required on Windows as Turbopack doesn't support WASM bindings.

### 7. Open Browser

Navigate to:
```
http://localhost:3000
```

Login with credentials:
- Username: `admin2`
- Password: `admin345`

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

## 📱 Platform Pages

### Dashboard (`/`)
- Overview statistics
- Recent activity feed
- Quick actions
- Performance metrics

### CRM (`/crm`)
- Kanban board with 4 stages: Cold, Warm, Reservation, Booked
- Drag-and-drop lead management
- Lead cards with key information
- Quick edit and notes

### AI Outreach (`/outreach`)
- Select lead from dropdown
- Choose branch (Festivals, Schools, Wedding, Night Club)
- Generate personalized email with AI
- Hybrid system: Ollama AI + Smart Templates
- Copy to clipboard functionality

### Lead Discovery (`/discovery`)
- Search for new prospects
- Filter by branch
- View company details
- Add directly to CRM
- Social media links

### Planning (`/planning`)
- Timeline view of all events
- Event cards with key details
- **View Details** button - Opens detailed modal with:
  - Complete event information
  - Customer contact details
  - Budget breakdown
  - Event notes and timeline
- **Export** button - Downloads event as JSON:
  - Filename format: `eventname_YYYYMMDD.json`
  - Complete event data included
- Search events by name
- Filter by branch and status
- Color-coded by branch
- Status badges (Pending, Confirmed, Completed, Cancelled)

### Installations (`/installations`)
- Catalog of artistic installations
- Detailed specifications
- Photos and videos
- Technical requirements
- Availability status

### Media (`/media`)
- Centralized asset library
- Upload and organize media
- Tag and search functionality
- Preview and download

## 🤖 AI Email Generation

### Hybrid AI System

The platform uses a sophisticated hybrid approach:

#### Mode 1: Ollama AI (Primary)
- Uses local AI model (qwen2.5:1.5b recommended)
- 8-second timeout for responsiveness
- Natural, contextual, varied emails
- Metadata: `mode: "ollama"`

#### Mode 2: Smart Templates (Fallback)
- Activates if Ollama unavailable or times out
- High-quality personalized templates
- Instant response (<1 second)
- Metadata: `mode: "fallback"`

### Supported Models
- qwen2.5:1.5b (recommended for speed)
- phi3
- gemma2
- llama3.2

### Installation
```bash
# Install Ollama
# Download from https://ollama.ai

# Pull recommended model
ollama pull qwen2.5:1.5b

# Start Ollama service
ollama serve
```

## 📊 Database Schema

### auth_users Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| username | TEXT | NO | Unique username (3-50 chars) |
| password_hash | TEXT | NO | Bcrypt hashed password |
| full_name | TEXT | NO | User's full name |
| email | TEXT | NO | Unique email address |
| role | TEXT | NO | User role (admin/manager/staff/etc) |
| department | TEXT | YES | User department |
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

### events Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| name | TEXT | NO | Event name |
| branch | TEXT | NO | Event branch/type |
| status | TEXT | NO | Event status |
| event_date | DATE | YES | Event date |
| customer_name | TEXT | YES | Customer name |
| customer_email | TEXT | YES | Customer email |
| customer_phone | TEXT | YES | Customer phone |
| venue_name | TEXT | YES | Venue name |
| venue_address | TEXT | YES | Venue address |
| budget_total | DECIMAL(15,2) | YES | Total budget |
| budget_paid | DECIMAL(15,2) | YES | Amount paid |
| notes | TEXT | YES | Event notes |
| lead_id | UUID | YES | Related lead ID |
| created_at | TIMESTAMP | NO | Creation time |
| updated_at | TIMESTAMP | NO | Last update time |

**Note:** The events table uses hard delete (no soft delete with deleted_at column).

### leads Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | UUID | NO | Primary key |
| company_name | TEXT | NO | Company name |
| contact_person | TEXT | YES | Contact person name |
| email | TEXT | YES | Contact email |
| phone | TEXT | YES | Contact phone |
| status | TEXT | NO | Pipeline status |
| branch | TEXT | NO | Business branch |
| temperature | TEXT | NO | Lead temperature |
| province | TEXT | YES | Province/state |
| country | TEXT | YES | Country |
| estimated_value | DECIMAL(15,2) | YES | Estimated deal value |
| website | TEXT | YES | Company website |
| notes | JSONB | YES | Notes array |
| interactions | JSONB | YES | Interactions array |
| social_links | JSONB | YES | Social media links |
| created_at | TIMESTAMP | NO | Creation time |
| updated_at | TIMESTAMP | NO | Last update time |

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Row Level Security** - Supabase RLS policies
- **Session Management** - Secure session tokens
- **Input Validation** - Username and email format checks
- **SQL Injection Protection** - Parameterized queries via Supabase
- **Environment Variables** - Sensitive data in .env.local
- **CORS Protection** - API route protection
- **Type Safety** - TypeScript for compile-time checks

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Lint code
npm run lint

# Build test
npm run build --webpack
```

## 📦 Production Deployment

### Build for Production

```bash
npm run build --webpack
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

Ensure these are set in your production environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OLLAMA_URL` (if using AI features)

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use:**
```bash
# Use different port
npm run dev --webpack -- -p 3001
```

**Ollama not responding:**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

**Database connection failed:**
1. Verify `.env.local` credentials
2. Check Supabase project status
3. Ensure migrations are run
4. Check browser console for errors

**Build errors:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev --webpack
```

## 📝 Notes

- **Windows Users**: Always use `--webpack` flag (Turbopack not supported)
- **PowerShell**: Use `;` for command chaining, not `&&`
- **Port**: Default is 3000, ensure it's not in use
- **Ollama**: Optional but recommended for best AI experience
- **Database**: Supabase free tier is sufficient for development

## 🔄 Migration Management

### Running Migrations

Migrations are located in `database/migrations/` and should be run in numerical order.

### Rollback

Each migration has a corresponding rollback file:
```bash
# Example: Rollback auth_users table
# Run: database/migrations/001_rollback_auth_users.sql
```

### Creating New Migrations

1. Create new SQL file with incremental number
2. Follow naming convention: `XXX_description.sql`
3. Include rollback instructions
4. Test in development first
5. Document in README

## 🤝 Contributing

This is a hackathon project built in 72 hours. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Update documentation

## 📄 License

Private project for Nebulist Platform.

## 🆘 Support

For issues or questions:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Verify Supabase connection
4. Check Ollama status if using AI features
5. Review migration logs in Supabase dashboard

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Project Structure

```
nebulist-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── crm/               # CRM page
│   ├── discovery/         # Lead discovery page
│   ├── outreach/          # AI outreach page
│   ├── planning/          # Event planning page
│   ├── installations/     # Installations catalog
│   └── media/             # Media library
├── components/            # React components
├── lib/                   # Utility functions and API
│   ├── api/              # API client functions
│   └── utils/            # Helper functions
├── database/              # Database files
│   └── migrations/       # SQL migration files
├── scripts/               # Utility scripts
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## 🚀 Performance Optimization

- **Code Splitting** - Automatic with Next.js App Router
- **Image Optimization** - Next.js Image component
- **Lazy Loading** - Dynamic imports for heavy components
- **Caching** - Zustand for client-side state
- **Database Indexing** - Optimized queries with indexes

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📊 System Requirements

- **Node.js**: 18.x or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for dependencies
- **OS**: Windows 10/11, macOS, Linux

---

**Built with ❤️ for Nebulist - Transforming Events into Unforgettable Experiences**
