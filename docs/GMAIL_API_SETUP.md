# Gmail API Setup Guide

Panduan lengkap untuk setup Gmail API agar sistem bisa membaca email otomatis dari willjanu6@gmail.com

## 🎯 Langkah 1: Buat Google Cloud Project

1. **Buka Google Cloud Console**
   - Kunjungi: https://console.cloud.google.com/
   - Login dengan akun Google Anda (willjanu6@gmail.com)

2. **Buat Project Baru**
   - Klik dropdown project di header (atau "Select a project")
   - Klik "NEW PROJECT"
   - Nama project: `nebulist-email-automation`
   - Klik "CREATE"

3. **Tunggu Project Dibuat**
   - Proses biasanya 10-30 detik
   - Pastikan project sudah aktif (terlihat di header)

## 🔑 Langkah 2: Enable Gmail API

1. **Buka API Library**
   - Di sidebar kiri, klik "APIs & Services" → "Library"
   - Atau kunjungi: https://console.cloud.google.com/apis/library

2. **Cari Gmail API**
   - Ketik "Gmail API" di search bar
   - Klik pada "Gmail API" dari hasil pencarian

3. **Enable API**
   - Klik tombol "ENABLE"
   - Tunggu beberapa detik hingga enabled

## 🔐 Langkah 3: Buat OAuth 2.0 Credentials

1. **Buka Credentials Page**
   - Di sidebar, klik "APIs & Services" → "Credentials"
   - Atau kunjungi: https://console.cloud.google.com/apis/credentials

2. **Configure OAuth Consent Screen** (jika belum)
   - Klik "CONFIGURE CONSENT SCREEN"
   - Pilih "External" (untuk testing)
   - Klik "CREATE"
   
   **Isi Form:**
   - App name: `Nebulist Email Automation`
   - User support email: `willjanu6@gmail.com`
   - Developer contact: `willjanu6@gmail.com`
   - Klik "SAVE AND CONTINUE"
   
   **Scopes:**
   - Klik "ADD OR REMOVE SCOPES"
   - Cari dan centang:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.modify`
   - Klik "UPDATE" → "SAVE AND CONTINUE"
   
   **Test Users:**
   - Klik "ADD USERS"
   - Tambahkan: `willjanu6@gmail.com`
   - Klik "ADD" → "SAVE AND CONTINUE"
   
   - Klik "BACK TO DASHBOARD"

3. **Buat OAuth Client ID**
   - Kembali ke "Credentials" page
   - Klik "CREATE CREDENTIALS" → "OAuth client ID"
   - Application type: "Web application"
   - Name: `Nebulist Web Client`
   
   **Authorized redirect URIs:**
   - Klik "ADD URI"
   - Tambahkan: `http://localhost:3000/api/auth/gmail/callback`
   - Tambahkan: `https://yourdomain.com/api/auth/gmail/callback` (untuk production)
   
   - Klik "CREATE"

4. **Download Credentials**
   - Setelah dibuat, akan muncul popup dengan Client ID dan Client Secret
   - **PENTING:** Copy dan simpan:
     - Client ID (format: `xxxxx.apps.googleusercontent.com`)
     - Client Secret (format: `GOCSPX-xxxxx`)
   - Atau klik "DOWNLOAD JSON" untuk backup

## 📝 Langkah 4: Tambahkan ke Environment Variables

1. **Buka file `.env.local`** di project Anda

2. **Tambahkan credentials:**
   ```env
   # Gmail API Configuration
   GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your_client_secret_here
   GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback
   GMAIL_USER_EMAIL=willjanu6@gmail.com
   
   # Gmail Refresh Token (akan di-generate setelah OAuth flow)
   GMAIL_REFRESH_TOKEN=
   ```

3. **Save file**

## 🔄 Langkah 5: Generate Refresh Token

Setelah setup selesai, Anda perlu melakukan OAuth flow sekali untuk mendapatkan refresh token:

1. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

2. **Buka browser:**
   ```
   http://localhost:3000/api/auth/gmail/authorize
   ```

3. **Login dengan Google:**
   - Pilih akun `willjanu6@gmail.com`
   - Klik "Continue" pada warning (karena app belum verified)
   - Klik "Allow" untuk memberikan permissions

4. **Copy Refresh Token:**
   - Setelah berhasil, akan muncul refresh token
   - Copy token tersebut
   - Paste ke `.env.local` di variable `GMAIL_REFRESH_TOKEN`

5. **Restart aplikasi:**
   ```bash
   # Stop dengan Ctrl+C
   npm run dev
   ```

## ✅ Verifikasi Setup

Setelah semua setup selesai, test dengan:

```bash
# Test Gmail connection
curl http://localhost:3000/api/email/test
```

Response yang benar:
```json
{
  "success": true,
  "message": "Gmail API connected successfully",
  "email": "willjanu6@gmail.com"
}
```

## 🔒 Security Notes

1. **JANGAN commit `.env.local`** ke Git
2. **JANGAN share Client Secret** dengan siapapun
3. **JANGAN share Refresh Token** dengan siapapun
4. Untuk production, gunakan environment variables di hosting platform

## 📚 Resources

- Gmail API Documentation: https://developers.google.com/gmail/api
- OAuth 2.0 Guide: https://developers.google.com/identity/protocols/oauth2
- Scopes Reference: https://developers.google.com/gmail/api/auth/scopes

## ❓ Troubleshooting

**Error: "Access blocked: This app's request is invalid"**
- Pastikan OAuth consent screen sudah dikonfigurasi
- Pastikan email Anda ada di Test Users list

**Error: "redirect_uri_mismatch"**
- Pastikan redirect URI di Google Cloud Console sama persis dengan yang di code
- Cek tidak ada trailing slash atau typo

**Error: "invalid_grant"**
- Refresh token expired atau invalid
- Ulangi OAuth flow untuk generate token baru

---

**Status:** Setup manual diperlukan sebelum sistem email automation bisa berjalan.
