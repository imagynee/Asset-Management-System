const express = require('express');
const {
    getDashboard,
    getWarrantyAlerts
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/warranty-alerts', getWarrantyAlerts);
router.get('/', getDashboard);

module.exports = router;
