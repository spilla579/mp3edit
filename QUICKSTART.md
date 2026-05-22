# ⚡ QUICKSTART - Bắt đầu nhanh (5 phút)

## 🎯 Mục tiêu
Chạy tool lọc MP3 trong 5 phút

---

## 📋 Yêu cầu

✅ **Node.js 14+** - https://nodejs.org/ (LTS)
✅ **FFmpeg** - https://ffmpeg.org/download.html

### Kiểm tra cài đặt:
```bash
node --version
npm --version
ffmpeg -version
```

Tất cả phải có kết quả (không có lỗi)

---

## 🚀 Bắt đầu (3 lệnh)

### 1️⃣ Cài dependencies
```bash
npm install
```
⏱️ Chờ ~2-3 phút

### 2️⃣ Chạy server
```bash
npm start
```

Bạn sẽ thấy:
```
🎵 MP3 Filter Tool v2.0
Chạy tại: http://localhost:3000
```

### 3️⃣ Mở trình duyệt
```
http://localhost:3000
```

---

## 📖 Quy trình sử dụng

```
1. Tải lên file MP3
   ↓
2. Xem danh sách từ nhạy cảm phát hiện
   ↓
3. Tải lên file âm thanh thay thế (cho mỗi từ)
   ↓
4. Xử lý & tải xuống kết quả
```

---

## ⚙️ Thêm từ nhạy cảm của riêng bạn

Mở `server.js`, tìm:
```javascript
const SENSITIVE_WORDS = {
  'badword1': { severity: 'high', category: 'profanity', language: 'en' },
```

Thêm từ của bạn:
```javascript
const SENSITIVE_WORDS = {
  'từ_1': { severity: 'high', category: 'profanity', language: 'vi' },
  'từ_2': { severity: 'medium', category: 'profanity', language: 'vi' },
  'badword1': { severity: 'high', category: 'profanity', language: 'en' },
```

Khởi động lại: `npm start`

---

## 🛑 Tắt server

```bash
Ctrl + C
```

---

## 🐛 Vấn đề thường gặp

### "npm: command not found"
→ Cài Node.js từ https://nodejs.org/

### "ffmpeg: command not found"
→ Cài FFmpeg từ https://ffmpeg.org/download.html

### "Port 3000 already in use"
```bash
PORT=3001 npm start
```

---

## 📞 Cần giúp?

Xem file `README.md` để biết chi tiết hơn
