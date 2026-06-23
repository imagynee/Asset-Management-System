const express = require('express');
const multer = require('multer');
const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/CategoryController');

const router = express.Router();
const upload = multer();

router.post('/', upload.none(), createCategory);
router.get('/', getCategories);
// router.put('/:id', upload.none(), updateCategory);
router.patch('/:id', upload.none(), updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
