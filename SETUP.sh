#!/bin/bash

# MP3 Filter Tool - Setup Script for macOS/Linux
# Cài đặt tự động Node.js, FFmpeg, và dependencies

echo "╔═══════════════════════════════════════╗"
echo "║  🎵 MP3 Filter Tool - Setup Script   ║"
echo "║  macOS / Linux                        ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
echo "🔍 Kiểm tra Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt"
    echo ""
    echo "📥 Cài đặt Node.js..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew chưa được cài đặt. Vui lòng cài đặt từ: https://brew.sh"
            exit 1
        fi
        brew install node
    else
        # Linux
        echo "❌ Vui lòng cài đặt Node.js từ https://nodejs.org/"
        exit 1
    fi
else
    echo "✅ Node.js: $(node --version)"
fi

echo ""

# Check if FFmpeg is installed
echo "🔍 Kiểm tra FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg chưa được cài đặt"
    echo ""
    echo "📥 Cài đặt FFmpeg..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew chưa được cài đặt"
            exit 1
        fi
        brew install ffmpeg
    else
        # Linux
        sudo apt-get update
        sudo apt-get install -y ffmpeg
    fi
else
    echo "✅ FFmpeg: $(ffmpeg -version | head -1)"
fi

echo ""
echo "✅ Tất cả yêu cầu hệ thống đã sẵn sàng!"
echo ""

# Install dependencies
echo "📦 Cài đặt npm dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Cài đặt thành công!"
    echo ""
    echo "🚀 Để chạy server:"
    echo "   npm start"
    echo ""
    echo "📍 Truy cập: http://localhost:3000"
    echo ""
else
    echo "❌ Lỗi khi cài đặt dependencies"
    exit 1
fi
