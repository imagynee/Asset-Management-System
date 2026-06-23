const express = require('express');
const multer = require('multer');
const {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

const router = express.Router();
const upload = multer();


router.get('/', getDepartments);
router.post('/', upload.none(), createDepartment);

router.patch('/:id', upload.none(), updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;
