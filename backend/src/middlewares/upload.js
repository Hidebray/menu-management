const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Lưu vào thư mục uploads/ ở root
  },
  filename: function (req, file, cb) {
    // Đặt tên file: thời-gian-hiện-tại + số-ngẫu-nhiên + đuôi-file-gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Bộ lọc chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .png and .webp format allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: fileFilter
});

module.exports = upload;