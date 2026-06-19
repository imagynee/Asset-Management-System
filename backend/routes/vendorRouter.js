const express = require('express');
const multer = require('multer');
const {
    createVendor,
    getVendors
} = require('../controllers/vendorController');

const router = express.Router();
const upload = multer();

router.post('/', upload.none(), createVendor);
router.get('/', getVendors);

module.exports = router;
