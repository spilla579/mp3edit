const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configuration
const UPLOAD_DIR = '/tmp/uploads';
const OUTPUT_DIR = '/tmp/output';
const TEMP_DIR = '/tmp/temp';

// Create directories for local development
if (process.env.NODE_ENV !== 'production') {
  [UPLOAD_DIR, OUTPUT_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// Multer configuration - Memory storage for Vercel
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for Vercel
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file audio (MP3, WAV, M4A)'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Sessions storage (in-memory)
const sessions = new Map();

// SENSITIVE WORDS DATABASE
const SENSITIVE_WORDS = {
  'badword1': { severity: 'high', category: 'profanity', language: 'en' },
  'badword2': { severity: 'high', category: 'profanity', language: 'en' },
  'inappropriate': { severity: 'medium', category: 'inappropriate', language: 'en' },
  'offensive': { severity: 'medium', category: 'offensive', language: 'en' },
  'từ_nhạy_cảm_1': { severity: 'high', category: 'profanity', language: 'vi' },
  'từ_nhạy_cảm_2': { severity: 'high', category: 'profanity', language: 'vi' },
};

// ============ API ROUTES ============

/**
 * POST /api/upload
 * Tải lên file MP3 và phân tích
 */
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'Không có file được tải lên' 
      });
    }

    if (req.file.buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'File quá lớn. Tối đa 10MB (cho Vercel)'
      });
    }

    const sessionId = uuidv4();
    const originalName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    console.log(`[${sessionId}] Upload file: ${originalName}, Size: ${fileBuffer.length} bytes`);

    // Phân tích từ nhạy cảm (mô phỏng)
    const detectedWords = await detectSensitiveWords();
    console.log(`[${sessionId}] Phát hiện ${detectedWords.length} từ nhạy cảm`);

    // Tính thời lượng (mô phỏng)
    const duration = Math.floor(Math.random() * 300) + 60; // 1-5 phút

    // Lưu session
    sessions.set(sessionId, {
      sessionId,
      fileBuffer,
      originalName,
      duration,
      detectedWords,
      replacements: {},
      status: 'awaiting_replacements',
      createdAt: new Date(),
      fileSize: fileBuffer.length
    });

    res.json({
      success: true,
      sessionId,
      duration,
      detectedWords,
      fileSize: fileBuffer.length,
      message: 'Tải lên và phân tích thành công'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi tải lên'
    });
  }
});

/**
 * POST /api/replacement/:sessionId/:wordIndex
 * Tải lên file thay thế
 */
app.post('/api/replacement/:sessionId/:wordIndex', upload.single('replacement'), async (req, res) => {
  try {
    const { sessionId, wordIndex } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session không tìm thấy' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'Không có file thay thế' 
      });
    }

    const word = session.detectedWords[wordIndex];
    if (!word) {
      return res.status(400).json({ 
        success: false,
        error: 'Từ không tìm thấy' 
      });
    }

    // Lưu file thay thế (buffer)
    session.replacements[wordIndex] = {
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      uploadedAt: new Date()
    };

    const allReplaced = session.detectedWords.every((_, idx) => session.replacements[idx]);

    res.json({
      success: true,
      word: word.word,
      wordIndex,
      allReplaced,
      replacedCount: Object.keys(session.replacements).length,
      totalWords: session.detectedWords.length,
      message: `Thay thế cho từ "${word.word}" đã được lưu`
    });

  } catch (error) {
    console.error('Replacement error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi tải lên thay thế'
    });
  }
});

/**
 * POST /api/process/:sessionId
 * Xử lý âm thanh
 */
app.post('/api/process/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session không tìm thấy' 
      });
    }

    const allReplaced = session.detectedWords.every((_, idx) => session.replacements[idx]);
    if (!allReplaced) {
      const missing = session.detectedWords
        .map((w, idx) => !session.replacements[idx] ? w.word : null)
        .filter(Boolean);
      
      return res.status(400).json({ 
        success: false,
        error: `Chưa có đủ tất cả các thay thế. Còn thiếu: ${missing.join(', ')}`
      });
    }

    session.status = 'processing';
    console.log(`[${sessionId}] Bắt đầu xử lý âm thanh`);

    // Xử lý: Tạo output buffer (mô phỏng ghép nhập audio)
    // Trong production, sử dụng ffmpeg với dynamic compilation
    const outputBuffer = await createProcessedAudio(
      session.fileBuffer,
      session.detectedWords,
      session.replacements
    );

    session.status = 'completed';
    session.outputBuffer = outputBuffer;
    session.completedAt = new Date();

    console.log(`[${sessionId}] Xử lý hoàn tất, kích thước: ${outputBuffer.length} bytes`);

    res.json({
      success: true,
      downloadUrl: `/api/download/${sessionId}`,
      sessionId,
      outputSize: outputBuffer.length,
      message: 'Xử lý âm thanh hoàn tất'
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi xử lý'
    });
  }
});

/**
 * GET /api/download/:sessionId
 * Tải xuống file đã xử lý
 */
app.get('/api/download/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session || !session.outputBuffer) {
      return res.status(404).json({ 
        success: false,
        error: 'File không tìm thấy' 
      });
    }

    const filename = `${session.originalName.split('.')[0]}_cleaned.mp3`;
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', session.outputBuffer.length);
    
    res.send(session.outputBuffer);

    console.log(`[${sessionId}] Tải xuống: ${filename}`);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi tải xuống'
    });
  }
});

/**
 * GET /api/session/:sessionId
 * Lấy thông tin chi tiết session
 */
app.get('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session không tìm thấy' 
      });
    }

    res.json({
      success: true,
      sessionId,
      status: session.status,
      duration: session.duration,
      originalName: session.originalName,
      detectedWords: session.detectedWords,
      replacementsCount: Object.keys(session.replacements).length,
      totalWords: session.detectedWords.length,
      createdAt: session.createdAt,
      completedAt: session.completedAt,
      fileSize: session.fileSize
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi'
    });
  }
});

/**
 * GET /api/sessions
 * Danh sách tất cả sessions
 */
app.get('/api/sessions', (req, res) => {
  const sessionsList = Array.from(sessions.values()).map(s => ({
    sessionId: s.sessionId,
    originalName: s.originalName,
    status: s.status,
    duration: s.duration,
    detectedWords: s.detectedWords.length,
    replacedWords: Object.keys(s.replacements).length,
    createdAt: s.createdAt
  }));

  res.json({
    success: true,
    sessions: sessionsList,
    total: sessionsList.length
  });
});

/**
 * DELETE /api/session/:sessionId
 * Xóa session
 */
app.delete('/api/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Session không tìm thấy' 
      });
    }

    sessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Session đã được xóa'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message || 'Lỗi'
    });
  }
});

// ============ HELPER FUNCTIONS ============

/**
 * Phát hiện từ nhạy cảm (mô phỏng)
 */
async function detectSensitiveWords() {
  const detectedWords = [];

  for (const [word, metadata] of Object.entries(SENSITIVE_WORDS)) {
    const timestamp1 = Math.floor(Math.random() * 100) + 10;
    const timestamp2 = Math.floor(Math.random() * 100) + 150;
    
    detectedWords.push({
      word,
      ...metadata,
      timestamps: Math.random() > 0.5 ? [timestamp1, timestamp2] : [timestamp1],
      count: Math.random() > 0.5 ? 2 : 1
    });
  }

  return detectedWords;
}

/**
 * Tạo audio đã xử lý (mô phỏng)
 * Trong production, cần sử dụng ffmpeg hoặc audio library khác
 */
async function createProcessedAudio(inputBuffer, detectedWords, replacements) {
  // Mô phỏng: Tạo buffer chứa dữ liệu audio
  // Trong production, cần:
  // 1. Decode audio từ inputBuffer
  // 2. Cut audio tại timestamps
  // 3. Replace bằng audio từ replacements
  // 4. Encode lại thành MP3

  // Hiện tại, trả về một buffer mô phỏng
  return Buffer.from(inputBuffer);
}

// ============ ERROR HANDLING ============

// Multer error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: `File quá lớn. Tối đa 10MB (Vercel limit). Bạn tải: ${err.field}`
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Chỉ được tải 1 file cùng lúc'
      });
    }
  }

  if (err.message && err.message.includes('audio')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Lỗi server nội bộ'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MP3 Filter Tool is running' });
});

// ============ EXPORT FOR VERCEL ============

module.exports = app;

// ============ START LOCAL SERVER ============

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🎵 MP3 Filter Tool v2.0             ║
║   Chạy tại: http://localhost:${PORT}   ║
║   Nhấn Ctrl+C để tắt server            ║
╚═══════════════════════════════════════╝
    `);
    console.log('');
  });
}
