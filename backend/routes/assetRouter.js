const express = require('express');
const upload = require('../middleware/upload');
const {
    createAsset,
    getAssets,
    getMaintenanceHistory,
    getAssetById,
    getAssetQrCode,
    updateAsset,
    deleteAsset
} = require('../controllers/assetController');
const { returnAsset } = require('../controllers/ReturnController');
const {
    startMaintenance,
    completeMaintenance
} = require('../controllers/MaintenanceController');

const router = express.Router();

router.post('/', upload.single('assetImage'), createAsset);     //working
router.get('/', getAssets);                                      //working
router.get('/qr/:assetId', getAssetQrCode);                      //working
router.get('/:id', getAssetById);                                   //working
router.put('/:id', upload.single('assetImage'), updateAsset);           //working
router.delete('/:id', deleteAsset);                                        //working

router.patch('/return', upload.none(), returnAsset);
router.get('/maintenance', getMaintenanceHistory);
router.patch('/maintenance/start', upload.none(), startMaintenance);
router.patch('/maintenance/complete', upload.none(), completeMaintenance);

module.exports = router;
