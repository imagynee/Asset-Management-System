const express = require('express');
const multer = require('multer');
const {
    createCategory,
    getCategories
} = require('../controllers/CategoryController');

const router = express.Router();
const upload = multer();

router.post('/', upload.none(), createCategory);
router.get('/', getCategories);

module.exports = router;
