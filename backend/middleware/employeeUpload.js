const fs = require('fs');
const path = require('path');
const multer = require('multer');

const profilePicDir = path.join(__dirname, '..', 'uploads', 'employee', 'profilepic');
const idProofDir = path.join(__dirname, '..', 'uploads', 'employee', 'idproofs');

// Ensure upload folders exist before Multer tries to write files.
fs.mkdirSync(profilePicDir, { recursive: true });
fs.mkdirSync(idProofDir, { recursive: true });

const allowedExtensions = {
    profilePic: ['.jpg', '.jpeg', '.png'],
    idProofDoc: ['.pdf', '.jpg', '.jpeg', '.png']
};

const allowedMimeTypes = {
    profilePic: ['image/jpeg', 'image/png'],
    idProofDoc: ['application/pdf', 'image/jpeg', 'image/png']
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'profilePic') {
            return cb(null, profilePicDir);
        }

        if (file.fieldname === 'idProofDoc') {
            return cb(null, idProofDir);
        }

        return cb(new Error('Invalid upload field'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();      //get extension of recieved file.
        const safeBaseName = path                                //replace unwanted characters in the fileName & make it safe for saving.
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 40);

        cb(null, `${file.fieldname}-${Date.now()}-${safeBaseName}${ext}`);  //also prevents duplicated filenames
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const fieldExtensions = allowedExtensions[file.fieldname];        //get allowed field extensions for profilepic or idproof according to file.fieldname
    const fieldMimeTypes = allowedMimeTypes[file.fieldname];        

    if (!fieldExtensions || !fieldMimeTypes) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }

    if (!fieldExtensions.includes(ext) || !fieldMimeTypes.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type for ${file.fieldname}`));
    }

    return cb(null, true);
};

const employeeUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024               //5 MB max file size
    }
});

module.exports = employeeUpload;


// 1. File arrives
//         ↓
// 2. fileFilter()
//    Is it allowed?
//         ↓
// 3. destination()
//    Which folder?
//         ↓
// 4. filename()
//    What name?
//         ↓
// 5. Create multer object
//         ↓
// 6. Put file info in req.file / req.files
//         ↓
// 7. Call controller
