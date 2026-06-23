const express = require('express');
const employeeUpload = require('../middleware/employeeUpload');
const {
    createEmployee,
    getEmployeeById,
    getEmployeeHistory,
    getEmployees,
    updateEmployee,
    deleteEmployee,
    assignAsset,
} = require('../controllers/EmployeeController');

const router = express.Router();

const uploadEmployeeDocuments = employeeUpload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'idProofDoc', maxCount: 1 }
]);

router.post('/', uploadEmployeeDocuments, createEmployee);      //working
router.get('/', getEmployees);                              //working
router.get('/:id', getEmployeeById);                        //working
router.get('/:id/history', getEmployeeHistory);             //working
router.patch('/assign', assignAsset);                   //working  

router.patch('/:id', uploadEmployeeDocuments, updateEmployee);
router.delete('/:id', deleteEmployee);


module.exports = router;
