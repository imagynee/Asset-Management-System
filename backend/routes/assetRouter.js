const express = require('express');
const upload = require('../middleware/upload');
const {
    createAsset,
    getAssets,
    getAssetById,
    getAssetQrCode,
    updateAsset,
    deleteAsset,
    returnAsset
} = require('../controllers/assetController');

const router = express.Router();

router.post('/', upload.single('assetImage'), createAsset);     //working
router.get('/', getAssets);                                      //working
router.get('/qr/:assetId', getAssetQrCode);                      //working
router.get('/:id', getAssetById);                                   //working
router.put('/:id', upload.single('assetImage'), updateAsset);           //working
router.delete('/:id', deleteAsset);                                        //working

router.patch('/:id/return', upload.none(), returnAsset);                    //working

module.exports = router;
