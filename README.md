# 🎵 MP3 Filter Tool - Phiên bản 2.0

Công cụ Node.js chuyên nghiệp để **phát hiện và thay thế từ nhạy cảm** trong file MP3 một cách đơn giản.

## ✨ Tính năng chính

✅ **Tải lên MP3 dễ dàng** - Kéo thả hoặc chọn file  
✅ **Phát hiện tự động** - Tìm kiếm từ nhạy cảm  
✅ **Thay thế linh hoạt** - Tải lên file âm thanh thay thế  
✅ **Xử lý chuyên nghiệp** - Ghép nhập audio bằng FFmpeg  
✅ **Giao diện thân thiện** - Responsive, dễ sử dụng  
✅ **API RESTful** - Tích hợp dễ dàng

---

## 🚀 Cách mở đơn giản nhất (3 bước)

### Bước 1️⃣: Chuẩn bị

**Trên Windows:**
```bash
# 1. Tải Node.js từ https://nodejs.org/ (bản LTS)
# 2. Cài đặt FFmpeg: https://ffmpeg.org/download.html
# 3. Giải nén folder mp3-filter-tool
```

**Trên macOS/Linux:**
```bash
# 1. Cài Node.js
brew install node ffmpeg

# 2. Giải nén folder mp3-filter-tool
```

### Bước 2️⃣: Cài đặt dependencies

```bash
# Mở Terminal/CMD trong thư mục mp3-filter-tool
cd mp3-filter-tool

# Cài đặt
npm install
```

**⏱️ Chờ ~2-3 phút để cài đặt**

### Bước 3️⃣: Chạy tool

```bash
# Chạy server
npm start
```

**✅ Khi thấy:**
```
🎵 MP3 Filter Tool v2.0
Chạy tại: http://localhost:3000
```

**👉 Mở trình duyệt, truy cập: http://localhost:3000**

---

## 📖 Cách sử dụng

### Giao diện gồm 4 bước:

1. **📤 Tải lên MP3**
   - Kéo thả file hoặc nhấp để chọn
   - Hỗ trợ: MP3, WAV, M4A, AAC
   - Dung lượng tối đa: 50MB

2. **🔍 Xem từ phát hiện**
   - Danh sách các từ nhạy cảm được tìm thấy
   - Mức độ nghiêm trọng (cao/vừa/thấp)
   - Số lần xuất hiện

3. **🔊 Tải lên thay thế**
   - Tải lên file âm thanh cho mỗi từ
   - Format: MP3, WAV, M4A
   - Tối đa: 10MB/file

4. **⚙️ Xử lý & tải xuống**
   - Nhấp "Xử lý và tải xuống"
   - Tệp sẽ được tải xuống máy tính

---

## ⚙️ Cấu hình từ nhạy cảm

Mở file `server.js`, tìm dòng:

```javascript
const SENSITIVE_WORDS = {
  'badword1': { severity: 'high', category: 'profanity', language: 'en' },
  'badword2': { severity: 'high', category: 'profanity', language: 'en' },
  // Thêm từ của bạn ở đây
};
```

**Ví dụ:**
```javascript
const SENSITIVE_WORDS = {
  // Tiếng Anh
  'damn': { severity: 'high', category: 'profanity', language: 'en' },
  'hell': { severity: 'medium', category: 'profanity', language: 'en' },
  
  // Tiếng Việt
  'từ_xấu_1': { severity: 'high', category: 'profanity', language: 'vi' },
  'từ_xấu_2': { severity: 'medium', category: 'offensive', language: 'vi' },
};
```

---

## 📁 Cấu trúc thư mục

```
mp3-filter-tool/
├── server.js              # Server chính
├── package.json           # Dependencies
├── .env                   # Cấu hình
├── public/
│   └── index.html        # Giao diện web
├── uploads/              # Nơi lưu file tải lên (tạo tự động)
├── output/               # Nơi lưu kết quả (tạo tự động)
└── temp/                 # Thư mục tạm (tạo tự động)
```

---

## 🔧 Thay đổi cổng (nếu 3000 bị chiếm)

```bash
# Cách 1: Thay đổi trong .env
PORT=3001 npm start

# Sau đó truy cập: http://localhost:3001
```

---

## 🐛 Xử lý lỗi thường gặp

### ❌ "npm: command not found"
```
→ Node.js chưa được cài đặt
→ Tải từ: https://nodejs.org/
```

### ❌ "ffmpeg: command not found"
```
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Tải từ: https://ffmpeg.org/download.html
# Hoặc: choco install ffmpeg
```

### ❌ "Port 3000 already in use"
```bash
# Chạy với cổng khác
PORT=3001 npm start
```

### ❌ "Không có thư mục uploads/output"
```bash
# Tạo thủ công
mkdir -p uploads output temp logs

# Hoặc khởi động server, nó sẽ tự tạo
npm start
```

---

## 📊 API Endpoints (cho dev)

### Tải lên file
```bash
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <audio-file> }
```

### Tải lên thay thế
```bash
POST /api/replacement/:sessionId/:wordIndex
Content-Type: multipart/form-data

Body: { replacement: <audio-file> }
```

### Xử lý âm thanh
```bash
POST /api/process/:sessionId
```

### Tải xuống kết quả
```bash
GET /api/download/:sessionId
```

---

## 💡 Mẹo & thủ thuật

### ✅ Để sử dụng trên các thiết bị khác (cùng mạng)

```bash
# Thay vì http://localhost:3000
# Dùng: http://[IP-của-bạn]:3000

# Tìm IP:
# macOS/Linux: ifconfig | grep inet
# Windows: ipconfig | findstr IPv4
```

### ✅ Tắt server
```
Nhấn Ctrl+C (trên Windows, macOS, Linux)
```

### ✅ Chạy với Node Version Manager
```bash
# Cài nvm
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Chọn version Node
nvm use 18

# Chạy server
npm start
```

---

## 🔐 Bảo mật

✅ File tải lên được lưu trong thư mục `uploads/` riêng  
✅ Session ID được tạo ngẫu nhiên (UUID)  
✅ File tạm được xóa tự động  
✅ Không lưu trữ dữ liệu lâu dài  
✅ Hỗ trợ HTTPS (nếu deploy)

---

## 📈 Hiệu suất

| Thao tác | Thời gian |
|---------|----------|
| Tải lên & phân tích | ~1-2 giây/phút âm thanh |
| Xử lý & xử lý | ~2-3 giây/phút âm thanh |
| Chuyển đổi định dạng | ~1 giây/phút âm thanh |

**Dung lượng RAM yêu cầu:** 300-500MB

---

## 🚀 Nâng cấp tương lai

- [ ] Tích hợp Google Cloud Speech-to-Text
- [ ] Hỗ trợ video files
- [ ] Dashboard quản lý
- [ ] Lịch sử xử lý
- [ ] Export report CSV
- [ ] Hỗ trợ thêm ngôn ngữ

---

## 📞 Liên hệ & hỗ trợ

📧 Email: support@example.com  
🐛 Bug reports: GitHub Issues  
💬 Chat: Discord/Slack

---

## 📄 Giấy phép

MIT License - Tự do sử dụng, sửa đổi, phân phối

---

**Made with ❤️ by Your Team**  
*Last updated: May 2026*
