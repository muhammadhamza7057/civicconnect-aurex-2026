const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../lib/cloudinaryClient');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    // Accept only jpg/jpeg, png, pdf
    const allowedExt = /\.(jpe?g|png|pdf)$/i;
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowedExt.test(ext)) return cb(new Error('Unsupported file type. Allowed: jpg, png, pdf'));
    cb(null, true);
  }
});

async function uploadFiles(files = []) {
  const results = [];
  for (const file of files) {
    const localPath = file.path;
    if (cloudinary.config().cloud_name) {
      try {
        const res = await cloudinary.uploader.upload(localPath, { folder: 'civicconnect' });
        results.push({ url: res.secure_url, name: file.originalname, provider: 'cloudinary' });
        // delete local file
        fs.unlink(localPath, () => {});
      } catch (err) {
        console.error('Cloudinary upload failed, using local', err.message);
        results.push({ url: `/uploads/${path.basename(localPath)}`, name: file.originalname, provider: 'local' });
      }
    } else {
      results.push({ url: `/uploads/${path.basename(localPath)}`, name: file.originalname, provider: 'local' });
    }
  }
  return results;
}

module.exports = { upload, uploadFiles };
