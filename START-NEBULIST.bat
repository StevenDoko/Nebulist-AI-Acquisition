@echo off
chcp 65001 >nul
title Nebulist Platform - Starting...

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║          🎨 NEBULIST PLATFORM - STARTUP SCRIPT            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json tidak ditemukan!
    echo    Pastikan file ini ada di folder nebulist-platform
    echo.
    pause
    exit /b 1
)

:: Check Node.js
echo [1/4] Mengecek Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak terinstall!
    echo    Download dari: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js terdeteksi: %NODE_VERSION%
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo [2/4] Installing dependencies...
    echo ⏳ Mohon tunggu, ini mungkin memakan waktu beberapa menit...
    call npm install
    if errorlevel 1 (
        echo ❌ Gagal install dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies berhasil diinstall
    echo.
) else (
    echo [2/4] ✅ Dependencies sudah terinstall
    echo.
)

:: Check Ollama
echo [3/4] Mengecek Ollama AI...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama tidak terdeteksi di http://localhost:11434
    echo    Platform akan menggunakan fallback mode
    echo    Untuk mengaktifkan AI: 
    echo    1. Install Ollama dari https://ollama.ai/
    echo    2. Jalankan: ollama serve
    echo    3. Pull model: ollama pull llama3.2
    echo.
) else (
    echo ✅ Ollama AI terdeteksi dan berjalan!
    echo.
)

:: Start dev server
echo [4/4] Menjalankan development server...
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Server akan berjalan di: http://localhost:3000           ║
echo ║  Browser akan terbuka otomatis dalam 5 detik...           ║
echo ║                                                            ║
echo ║  Tekan Ctrl+C untuk menghentikan server                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

:: Open browser after 5 seconds
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
npm run dev --webpack

:: If server stops
echo.
echo ═══════════════════════════════════════════════════════════
echo Server telah dihentikan.
echo.
pause
