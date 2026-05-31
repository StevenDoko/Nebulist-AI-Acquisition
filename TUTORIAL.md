# 🎨 Nebulist Platform - Tutorial Menjalankan Aplikasi

## 🔑 Login Credentials

**Akun Admin Default:**
- **Username:** `admin2` atau `admin3`
- **Password:** `admin345`

Gunakan kredensial ini untuk login setelah aplikasi berjalan.

## 📋 Prasyarat

Sebelum menjalankan aplikasi, pastikan sudah terinstall:

1. **Node.js** (versi 18 atau lebih baru)
   - Cek versi: `node --version`
   
2. **Ollama** (untuk AI email generation)
   - Download: https://ollama.ai/
   - Install model: `ollama pull phi3` (atau model lain yang tersedia)
   - Pastikan Ollama berjalan di: http://localhost:11434
   - Model yang didukung: phi3, qwen2.5, gemma2, llama3.2

## 🚀 Cara Menjalankan

### Metode 1: Menggunakan Shortcut (PALING MUDAH)

1. **Double-click file `START-NEBULIST.bat`** di folder `nebulist-platform`
   - Script akan otomatis:
     - Mengecek Ollama
     - Menjalankan dev server
     - Membuka browser ke http://localhost:3000

2. **Tunggu beberapa detik** sampai browser terbuka otomatis

3. **Selesai!** Platform siap digunakan

### Metode 2: Manual via Terminal

1. **Buka PowerShell/Command Prompt**

2. **Masuk ke folder project:**
   ```bash
   cd D:\Project\alex\nebulist-platform
   ```

3. **Install dependencies (hanya sekali):**
   ```bash
   npm install
   ```

4. **Jalankan development server:**
   ```bash
   npm run dev --webpack
   ```

5. **Buka browser** dan akses:
   ```
   http://localhost:3000
   ```

## 🤖 Mengecek Ollama

### Cek Status Ollama:
```bash
curl http://localhost:11434/api/tags
```

### Jika Ollama Belum Jalan:
```bash
# Start Ollama service
ollama serve

# Di terminal baru, pull model
ollama pull llama3.2
```

### Test Ollama:
```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing

# Atau test generate
Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body '{"model":"phi3:latest","prompt":"Hello","stream":false}' -ContentType "application/json"
```

## 📱 Navigasi Platform

### Halaman Utama:
- **Dashboard** (`/`) - Overview stats dan aktivitas
- **CRM** (`/crm`) - Manajemen leads dengan kanban board
- **AI Outreach** (`/outreach`) - Generate email dengan AI
- **Lead Discovery** (`/discovery`) - Cari prospek baru
- **Planning** (`/planning`) - Timeline view untuk event dengan fitur:
  - View Details: Lihat informasi lengkap event dalam modal
  - Export: Download data event sebagai file JSON
  - Search: Cari event berdasarkan nama
  - Filter: Filter berdasarkan branch dan status
- **Installations** (`/installations`) - Katalog instalasi
- **Media** (`/media`) - Library aset media

### Workflow Lengkap:

1. **Lead Discovery** → Cari prospek baru
2. **Add to CRM** → Tambahkan ke pipeline
3. **AI Outreach** → Generate email personalized
4. **CRM** → Track progress (Cold → Warm → Reservation → Booked)
5. **Planning** → Schedule event setelah booked

## 🎯 Fitur AI Outreach (Hybrid System)

Platform menggunakan **Hybrid AI System** untuk UX optimal:

### Mode 1: Ollama AI (Real AI Generation)
- Menggunakan model `qwen2.5:1.5b` untuk kecepatan optimal
- Timeout 8 detik untuk menjaga responsiveness
- Email lebih natural, bervariasi, dan contextual
- Metadata menunjukkan: `mode: "ollama"`

### Mode 2: Smart Template (Instant Fallback)
- Otomatis aktif jika Ollama timeout atau unavailable
- Template berkualitas tinggi dengan personalisasi penuh
- Response instant (<1 detik) untuk UX yang smooth
- Metadata menunjukkan: `mode: "fallback"`

### Cara Menggunakan:

1. **Pilih Lead** dari dropdown (contoh: "Lowlands Festival")
2. **Pilih Branch** (Festivals/Schools/Wedding/Night Club)
3. **Pilih Email Type:**
   - **Intro** - Email perkenalan pertama
   - **Follow-up** - Email follow-up
   - **Proposal** - Email proposal lengkap
4. **Pilih Installation** (opsional) - Fitur instalasi spesifik
5. **Custom Prompt** (opsional) - Tambahan instruksi untuk AI
6. **Klik "Generate Email"** - Sistem akan pilih mode terbaik

### Keuntungan Hybrid System:
✅ **Selalu responsif** - Tidak pernah hang atau timeout lama
✅ **Kualitas terjamin** - Baik AI maupun template berkualitas tinggi
✅ **Transparent** - Metadata menunjukkan mode yang digunakan
✅ **Production-ready** - Tidak bergantung pada Ollama availability

## 🎨 Branch System

Setiap branch punya karakteristik unik:

### 🎪 Festivals
- **Warna:** Purple/Pink gradient
- **Tone:** Energetic, bold, experiential
- **Target:** Festival organizers, event companies

### 🎓 Schools
- **Warna:** Blue/Cyan gradient
- **Tone:** Educational, inspiring, safe
- **Target:** Schools, universities, educational institutions

### 💍 Wedding
- **Warna:** Rose/Gold gradient
- **Tone:** Romantic, elegant, memorable
- **Target:** Wedding planners, venues, couples

### 🌙 Night Club
- **Warna:** Purple/Blue gradient
- **Tone:** Edgy, immersive, cutting-edge
- **Target:** Clubs, bars, nightlife venues

## 🛠️ Troubleshooting

### Port 3000 Sudah Digunakan:
```bash
# Matikan process di port 3000
npx kill-port 3000

# Atau gunakan port lain
npm run dev --webpack -- -p 3001
```

### Ollama Error:
```bash
# Restart Ollama
taskkill /F /IM ollama.exe
ollama serve
```

### TypeScript Errors:
```bash
# Clear cache dan rebuild
rm -rf .next
npm run dev --webpack
```

### Dependencies Error:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📊 Mock Data

Platform sudah dilengkapi dengan mock data realistis:

- **15 Leads** - Berbagai status dan branch
- **12 Installations** - Katalog lengkap dengan specs
- **8 Team Members** - Tim Nebulist
- **20+ Events** - Sample events di kalender

## 🔥 Tips & Tricks

1. **Gunakan Shortcut** - Paling cepat untuk development
2. **Ollama Optional** - Platform tetap jalan tanpa Ollama
3. **Hot Reload** - Perubahan code otomatis reload
4. **Dark Theme** - UI optimized untuk dark mode
5. **Responsive** - Bisa diakses dari mobile/tablet

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

## 🎬 Demo Flow untuk Hackathon

1. **Start dengan Dashboard** - Tunjukkan overview
2. **Lead Discovery** - Cari prospek baru (contoh: festival)
3. **Add to CRM** - Tambahkan ke pipeline
4. **AI Outreach** - Generate email dengan Ollama
5. **Show Email** - Tunjukkan hasil AI generation
6. **CRM Board** - Drag & drop lead antar status
7. **Planning** - Schedule event
8. **Installations** - Show katalog
9. **Media Library** - Show aset management

## 🚨 Catatan Penting

- **Windows Only:** Gunakan flag `--webpack` (Turbopack tidak support WASM bindings)
- **PowerShell:** Gunakan `;` untuk chain commands, bukan `&&`
- **Ollama:** Pastikan model `llama3.2` sudah di-pull
- **Port:** Default 3000, pastikan tidak bentrok

## 📞 Support

Jika ada masalah:
1. Cek console browser (F12) untuk error
2. Cek terminal untuk server error
3. Cek Ollama status: `curl http://localhost:11434/api/tags`
4. Restart server dan Ollama

---

**Selamat mencoba! 🎉**

Platform ini dirancang untuk hackathon 72 jam dengan fokus pada UX flow, visual polish, dan demo realistis.
