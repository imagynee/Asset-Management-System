const express = require('express');
const multer = require('multer');
const {
    createVendor,
    getVendors,
    updateVendor,
    deleteVendor
} = require('../controllers/vendorController');

const router = express.Router();
const upload = multer();

router.post('/', upload.none(), createVendor);
router.get('/', getVendors);
// router.put('/:id', upload.none(), updateVendor);
router.patch('/:id', upload.none(), updateVendor);
router.delete('/:id', deleteVendor);

module.exports = router;
