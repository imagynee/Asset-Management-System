const express = require('express');
const {
    exportAssetReport,
    exportAllAssetsReport,
    exportAllEmployeesReport
} = require('../controllers/reportsController');

const router = express.Router();

router.get('/assets/all', exportAllAssetsReport);
router.get('/employees/all', exportAllEmployeesReport);
router.get('/assets/:reportType', exportAssetReport);


module.exports = router;
