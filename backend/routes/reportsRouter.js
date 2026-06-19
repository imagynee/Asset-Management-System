const express = require('express');
const {
    exportAssetReport,
    exportAllAssetsReport,
    exportAllEmployeesReport
} = require('../controllers/reportsController');

const router = express.Router();

router.get('/assets/all', exportAllAssetsReport);
router.get('/assets/:reportType', exportAssetReport);
router.get('/employees/all', exportAllEmployeesReport);

module.exports = router;
