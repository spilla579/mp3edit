@echo off
REM MP3 Filter Tool - Setup Script for Windows
REM Cài đặt tự động Node.js, FFmpeg, và dependencies

setlocal enabledelayedexpansion

echo ╔═══════════════════════════════════════╗
echo ║  🎵 MP3 Filter Tool - Setup Script   ║
echo ║  Windows                              ║
echo ╚═══════════════════════════════════════╝
echo.

REM Check if Node.js is installed
echo 🔍 Kiểm tra Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js chưa được cài đặt
    echo.
    echo 📥 Vui lòng tải Node.js từ: https://nodejs.org/
    echo    Chọn bản LTS ^(Long Term Support^)
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo ✅ Node.js: !NODE_VER!
)

echo.

REM Check if FFmpeg is installed
echo 🔍 Kiểm tra FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FFmpeg chưa được cài đặt
    echo.
    echo 📥 Cài đặt FFmpeg:
    echo    1. Tải từ: https://ffmpeg.org/download.html
    echo    2. Giải nén vào: C:\ffmpeg
    echo    3. Thêm C:\ffmpeg\bin vào PATH
    echo.
    echo Hoặc sử dụng Chocolatey ^(nếu có^):
    echo    choco install ffmpeg
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('ffmpeg -version 2^>nul ^| findstr /R "ffmpeg version"') do set FFMPEG_VER=%%i
    echo ✅ FFmpeg: !FFMPEG_VER!
)

echo.
echo ✅ Tất cả yêu cầu hệ thống đã sẵn sàng!
echo.

REM Install dependencies
echo 📦 Cài đặt npm dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ✅ Cài đặt thành công!
    echo.
    echo 🚀 Để chạy server:
    echo    npm start
    echo.
    echo 📍 Truy cập: http://localhost:3000
    echo.
    pause
) else (
    echo ❌ Lỗi khi cài đặt dependencies
    pause
    exit /b 1
)
