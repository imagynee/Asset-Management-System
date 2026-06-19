const express = require('express');
const {exportAssetReport} = require('../controllers/reportsController');

const router = express.Router();

router.get('/assets/:reportType', exportAssetReport);

module.exports = router;
