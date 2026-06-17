const fs = require('fs');
const path = require('path');
const multer = require('multer');

const assetUploadDir = path.join(__dirname, '..', 'uploads', 'assets');

fs.mkdirSync(assetUploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, assetUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }

    return cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
