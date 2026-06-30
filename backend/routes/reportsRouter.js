const express = require('express');
const {
    exportAssetReport,
    exportAllAssetsReport,
    exportAllEmployeesReport,
    generateReport,
    previewReport,
} = require('../controllers/reportsController');

const router = express.Router();

// Flexible endpoints used by the new Reports UI
router.get('/generate', generateReport);
router.get('/preview', previewReport);

// Legacy endpoints (kept for backward compat)
router.get('/assets/all', exportAllAssetsReport);
router.get('/employees/all', exportAllEmployeesReport);
router.get('/assets/:reportType', exportAssetReport);

module.exports = router;
