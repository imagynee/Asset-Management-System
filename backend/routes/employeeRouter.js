const express = require('express');
const employeeUpload = require('../middleware/employeeUpload');
const { createEmployee } = require('../controllers/EmployeeController');

const router = express.Router();

const uploadEmployeeDocuments = employeeUpload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idProofDoc', maxCount: 1 }
]);

router.post('/', uploadEmployeeDocuments, createEmployee);

module.exports = router;
