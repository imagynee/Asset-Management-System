const fs = require('fs');
const path = require('path');
const multer = require('multer');

const assetUploadDir = path.join(__dirname, '..', 'uploads', 'assets');
const invoiceUploadDir = path.join(__dirname, '..', 'uploads', 'asset-invoices');

fs.mkdirSync(assetUploadDir, { recursive: true });
fs.mkdirSync(invoiceUploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = file.fieldname === 'assetInvoice'
            ? invoiceUploadDir
            : assetUploadDir;

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'assetImage' && file.mimetype.startsWith('image/')) {
        return cb(null, true);
    }

    const allowedInvoiceTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (
        file.fieldname === 'assetInvoice' &&
        (file.mimetype.startsWith('image/') || allowedInvoiceTypes.includes(file.mimetype))
    ) {
        return cb(null, true);
    }

    return cb(new Error('Only asset images and invoice files are allowed'), false);
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
