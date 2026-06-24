const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const { populateAssetQuery, generateAssetQrCode } = require('./assetController');

const getRemarks = (req, defaultRemarks) => {
    return typeof req.body.remarks === 'string' && req.body.remarks.trim()
        ? req.body.remarks.trim()
        : defaultRemarks;
};

const findAssetFromFormData = async (req) => {
    const assetId = req.body.assetId || req.body.asset || req.body.id;

    if (!assetId) {
        return null;
    }

    if (mongoose.Types.ObjectId.isValid(assetId)) {
        return Asset.findOne({
            $or: [
                { _id: assetId },
                { assetId }
            ]
        });
    }

    return Asset.findOne({ assetId });
};

const startMaintenance = async (req, res) => {
    try {
        const existingAsset = await findAssetFromFormData(req);

        if (!req.body.assetId && !req.body.asset && !req.body.id) {
            return res.status(400).json({
                message: 'Asset id is required'
            });
        }

        if (!existingAsset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        if (existingAsset.status !== 'Assigned' || !existingAsset.assignedTo) {
            return res.status(400).json({
                message: 'Only assigned assets can be marked under maintenance'
            });
        }

        existingAsset.status = 'Maintenance';
        await existingAsset.save();

        const history = await AssetHistory.create({
            asset: existingAsset._id,
            employee: existingAsset.assignedTo,
            action: 'MAINTENANCE_STARTED',
            remarks: getRemarks(req, 'maintenance started'),
            actionDate: new Date()
        });

        const asset = await populateAssetQuery(Asset.findById(existingAsset._id));
        await generateAssetQrCode(asset);

        return res.status(200).json({
            message: 'Asset marked under maintenance successfully',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to start maintenance',
            error: error.message
        });
    }
};

const completeMaintenance = async (req, res) => {
    try {
        const existingAsset = await findAssetFromFormData(req);

        if (!req.body.assetId && !req.body.asset && !req.body.id) {
            return res.status(400).json({
                message: 'Asset id is required'
            });
        }

        if (!existingAsset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        if (existingAsset.status !== 'Maintenance' || !existingAsset.assignedTo) {
            return res.status(400).json({
                message: 'Only assets under maintenance can have maintenance completed'
            });
        }

        existingAsset.status = 'Assigned';
        await existingAsset.save();

        const history = await AssetHistory.create({
            asset: existingAsset._id,
            employee: existingAsset.assignedTo,
            action: 'MAINTENANCE_COMPLETED',
            remarks: getRemarks(req, 'maintenance completed'),
            actionDate: new Date()
        });

        const asset = await populateAssetQuery(Asset.findById(existingAsset._id));
        await generateAssetQrCode(asset);

        return res.status(200).json({
            message: 'Asset maintenance completed successfully',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to complete maintenance',
            error: error.message
        });
    }
};

module.exports = {
    startMaintenance,
    completeMaintenance
};
