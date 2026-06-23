const express = require('express');
const { getReturnedAssets } = require('../controllers/ReturnController');

const router = express.Router();

router.get('/', getReturnedAssets);

module.exports = router;
