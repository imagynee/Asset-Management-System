const express = require('express');
const upload = require('../middleware/upload');
const {
    createAsset,
    getAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
    assignAsset,
    returnAsset
} = require('../controllers/assetController');

const router = express.Router();

router.post('/', upload.single('assetImage'), createAsset);     //working
router.get('/', getAssets);                                      //working
router.get('/:id', getAssetById);                                   //working
router.put('/:id', upload.single('assetImage'), updateAsset);           //working
router.delete('/:id', deleteAsset);                                        //working

router.patch('/:id/assign', assignAsset);
router.patch('/:id/return', returnAsset);

module.exports = router;


