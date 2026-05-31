# 🎨 Nebulist Platform - Application Tutorial

## 🔑 Login Credentials

**Default Admin Account:**
- **Username:** `admin2` or `admin3`
- **Password:** `admin345`

Use these credentials to login after the application is running.

## 📋 Prerequisites

Before running the application, ensure you have installed:

1. **Node.js** (version 18 or newer)
   - Check version: `node --version`
   
2. **Ollama** (for AI email generation)
   - Download: https://ollama.ai/
   - Install model: `ollama pull phi3` (or other available models)
   - Ensure Ollama is running at: http://localhost:11434
   - Supported models: phi3, qwen2.5, gemma2, llama3.2

## 🚀 How to Run

### Method 1: Using Shortcut (EASIEST)

1. **Double-click the `START-NEBULIST.bat` file** in the `nebulist-platform` folder
   - The script will automatically:
     - Check Ollama status
     - Run the dev server
     - Open browser to http://localhost:3000

2. **Wait a few seconds** until the browser opens automatically

3. **Done!** The platform is ready to use

### Method 2: Manual via Terminal

1. **Open PowerShell/Command Prompt**

2. **Navigate to project folder:**
   ```bash
   cd D:\Project\alex\nebulist-platform
   ```

3. **Install dependencies (only once):**
   ```bash
   npm install
   ```

4. **Run development server:**
   ```bash
   npm run dev --webpack
   ```

5. **Open browser** and access:
   ```
   http://localhost:3000
   ```

## 🤖 Checking Ollama

### Check Ollama Status:
```bash
curl http://localhost:11434/api/tags
```

### If Ollama is Not Running:
```bash
# Start Ollama service
ollama serve

# In a new terminal, pull model
ollama pull llama3.2
```

### Test Ollama:
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing

# Or test generate
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body '{"model":"phi3:latest","prompt":"Hello","stream":false}' -ContentType "application/json"
```

## 📱 Platform Navigation

### Main Pages:
- **Dashboard** (`/`) - Overview stats and activity
- **CRM** (`/crm`) - Lead management with kanban board
- **AI Outreach** (`/outreach`) - Generate emails with AI
- **Lead Discovery** (`/discovery`) - Search for new prospects
- **Planning** (`/planning`) - Timeline view for events with features:
  - View Details: See complete event information in modal
  - Export: Download event data as JSON file
  - Search: Find events by name
  - Filter: Filter by branch and status
- **Installations** (`/installations`) - Installation catalog
- **Media** (`/media`) - Media asset library

### Complete Workflow:

1. **Lead Discovery** → Search for new prospects
2. **Add to CRM** → Add to pipeline
3. **AI Outreach** → Generate personalized email
4. **CRM** → Track progress (Cold → Warm → Reservation → Booked)
5. **Planning** → Schedule event after booked

## 🎯 AI Outreach Feature (Hybrid System)

The platform uses a **Hybrid AI System** for optimal UX:

### Mode 1: Ollama AI (Real AI Generation)
- Uses `qwen2.5:1.5b` model for optimal speed
- 8-second timeout to maintain responsiveness
- More natural, varied, and contextual emails
- Metadata shows: `mode: "ollama"`

### Mode 2: Smart Template (Instant Fallback)
- Automatically activates if Ollama times out or is unavailable
- High-quality templates with full personalization
- Instant response (<1 second) for smooth UX
- Metadata shows: `mode: "fallback"`

### How to Use:

1. **Select Lead** from dropdown (example: "Lowlands Festival")
2. **Select Branch** (Festivals/Schools/Wedding/Night Club)
3. **Click "Generate Email"**
4. **Wait 1-8 seconds** for AI generation
5. **Review Result** - Email ready to copy/send
6. **Check Metadata** - See which mode was used

### Tips:
- First generation may take longer (model loading)
- Subsequent generations are faster (model cached)
- If Ollama unavailable, fallback mode activates automatically
- Both modes produce professional, personalized emails

## 📅 Planning Page Features

### Timeline View:
- Visual timeline of all events
- Color-coded by branch (Festivals, Schools, Wedding, Night Club)
- Status indicators (Pending, Confirmed, Completed, Cancelled)

### Event Cards:
Each event card displays:
- Event name and branch
- Event date
- Customer information
- Budget details
- Status badge

### Actions:
1. **View Details** - Opens detailed modal with:
   - Complete event information
   - Customer contact details
   - Budget breakdown
   - Event notes
   - Timeline dates

2. **Export** - Downloads event data as JSON:
   - Filename format: `eventname_YYYYMMDD.json`
   - Includes all event data
   - Can be imported or archived

### Search & Filter:
- **Search Bar**: Find events by name
- **Branch Filter**: Filter by event type
- **Status Filter**: Filter by event status

## 🔍 Lead Discovery

### How to Search:
1. Go to **Lead Discovery** page
2. Enter search term (example: "Lowlands Festival", "TU Delft", "Wedding Venue")
3. Select **Branch** (Festivals/Schools/Wedding/Night Club)
4. Click **Search**

### Search Results:
- Company name and description
- Contact information
- Website and social media
- Estimated value
- Location (province, country)

### Add to CRM:
1. Review prospect details
2. Click **"Add to CRM"**
3. Lead automatically added to CRM pipeline
4. Start tracking in CRM board

## 📊 CRM Dashboard

### Kanban Board:
Four pipeline stages:
- **Cold** - Initial contact
- **Warm** - Engaged prospects
- **Reservation** - Pending confirmation
- **Booked** - Confirmed clients

### Drag & Drop:
- Drag lead cards between columns
- Status updates automatically
- Real-time UI updates

### Lead Cards Show:
- Company name
- Contact person
- Email and phone
- Estimated value
- Temperature indicator
- Last interaction

### Actions:
- Click card to view details
- Edit lead information
- Add notes and interactions
- Track communication history

## 🎭 Installations Catalog

### Features:
- Browse artistic installations
- View detailed specifications
- See photos and videos
- Check availability
- Technical requirements

### Installation Types:
- Interactive light installations
- Projection mapping
- Kinetic sculptures
- Immersive experiences
- Custom installations

## 📁 Media Library

### Asset Management:
- Upload images and videos
- Organize by category
- Tag and search assets
- Preview media files
- Download originals

### Supported Formats:
- Images: JPG, PNG, GIF, WebP
- Videos: MP4, WebM
- Documents: PDF

## 🔐 User Roles

The platform supports multiple user roles:

- **Admin** - Full system access
- **Manager** - Team and project management
- **Staff** - Daily operations
- **Acquisition** - Lead generation and outreach
- **Operations** - Event execution
- **Creative** - Design and installations

## 💡 Pro Tips

1. **Use Shortcut** - Fastest for development
2. **Ollama Optional** - Platform works without Ollama
3. **Hot Reload** - Code changes auto-reload
4. **Dark Theme** - UI optimized for dark mode
5. **Responsive** - Accessible from mobile/tablet

## 📝 Development Commands

```bash
# Development server
npm run dev --webpack

# Build production
npm run build --webpack

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

## 🎬 Demo Flow for Hackathon

1. **Start with Dashboard** - Show overview
2. **Lead Discovery** - Search for prospects (example: festival)
3. **Add to CRM** - Add to pipeline
4. **AI Outreach** - Generate email with Ollama
5. **Show Email** - Display AI generation result
6. **CRM Board** - Drag & drop lead between statuses
7. **Planning** - Schedule event
8. **Installations** - Show catalog
9. **Media Library** - Show asset management

## 🚨 Important Notes

- **Windows Only:** Use `--webpack` flag (Turbopack doesn't support WASM bindings)
- **PowerShell:** Use `;` for command chaining, not `&&`
- **Ollama:** Ensure model `llama3.2` is pulled
- **Port:** Default 3000, ensure it's not in use

## 🐛 Troubleshooting

### Application Won't Start:
1. Check Node.js version: `node --version` (must be 18+)
2. Delete `node_modules` and `.next` folders
3. Run `npm install` again
4. Try `npm run dev --webpack`

### Ollama Not Working:
1. Check if Ollama is running: `curl http://localhost:11434/api/tags`
2. Start Ollama: `ollama serve`
3. Pull model: `ollama pull llama3.2`
4. Platform will use fallback mode if Ollama unavailable

### Port Already in Use:
1. Check what's using port 3000
2. Kill the process or use different port
3. Run: `npm run dev --webpack -- -p 3001`

### Database Connection Issues:
1. Check `.env.local` file exists
2. Verify Supabase credentials
3. Check Supabase project status
4. Review browser console for errors

## 📞 Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check terminal for server errors
3. Check Ollama status: `curl http://localhost:11434/api/tags`
4. Restart server and Ollama
5. Review migration logs in Supabase dashboard

## 🎯 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] Ollama installed and running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured with Supabase credentials
- [ ] Database migrations run in Supabase
- [ ] Dev server running (`npm run dev --webpack`)
- [ ] Browser open at http://localhost:3000
- [ ] Logged in with admin credentials

---

**Happy coding! 🎉**

This platform was built for a 72-hour hackathon with focus on UX flow, visual polish, and realistic demo.
