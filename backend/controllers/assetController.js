const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Employee = require('../models/Employee');



const buildAssetPayload = (req) => {
    const allowedFields = [
        'assetId',
        'assetName',
        'category',
        'vendor',
        'model',
        'serialNumber',
        'purchaseDate',
        'purchaseCost',
        'warrantyExpiry',
        'additionalNotes'
    ];

    const payload = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== '') {
            payload[field] = req.body[field];
        }
    });

    if (req.body.description && !payload.additionalNotes) {
        payload.additionalNotes = req.body.description;
    }

    if (req.file) {
        payload.assetImage = `/uploads/assets/${req.file.filename}`;
    }

    return payload;
};

const populateAssetQuery = (query) => {
    return query
        .populate('category')
        .populate('vendor')
        .populate('assignedTo');
};

const createAsset = async (req, res) => {
    
    try {
        const asset = await Asset.create(buildAssetPayload(req));
        
        await QRCode.toFile(`uploads/AssetQrCodes/${asset.assetId}.png`, asset.assetId);
        
        return res.status(201).json({
            message: 'Asset created successfully',
            asset
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to create asset',
            error: error.message
        });
    }
};

const getAssets = async (req, res) => {
    try {
        const [assets, categories, vendors] = await Promise.all([
            populateAssetQuery(Asset.find().sort({ createdAt: -1 })),
            Category.find().sort({ categoryName: 1 }),
            Vendor.find().sort({ vendorName: 1 })
        ]);

        return res.status(200).json({
            count: assets.length,
            assets,
            categories,
            status: ['Available', 'Assigned', 'Maintenance', 'Return Requested', 'Maintenance Requested'],
            vendors
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch assets',
            error: error.message
        });
    }
};

const getAssetById = async (req, res) => {
    try {
        const [asset, history] = await Promise.all([
            populateAssetQuery(Asset.findById(req.params.id)),
            AssetHistory.find({ asset: req.params.id })
                .populate('employee', 'name phone department')
                .sort({ actionDate: 1, createdAt: 1 })
        ]);

        if (!asset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        const assetHistory = history.map((entry) => {           // map for a cleaner response from history obeject.
            const historyItem = {
                action: entry.action
            };

            if (entry.action === 'assigned') {                      // assigned by and assign date
                historyItem.assignedTo = entry.employee;
                historyItem.assignedDate = entry.actionDate;
            }

            if (entry.action === 'returned') {                      // returned by and return date
                historyItem.returnedBy = entry.employee;
                historyItem.returnDate = entry.actionDate;        
            }

            return historyItem;
        });

        return res.status(200).json({ asset, assetHistory });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch asset',
            error: error.message
        });
    }
};

const assetQrCodesDir = path.join(__dirname, '..', 'uploads', 'AssetQrCodes');

const getAssetQrCode = (req, res) => {
    
    const qrFilePath = path.resolve(assetQrCodesDir, `${req.params.assetId}.png`);
    const qrCodesRoot = path.resolve(assetQrCodesDir);

    console.log(assetQrCodesDir);
    console.log(qrFilePath);
    console.log(qrCodesRoot);

    if (!qrFilePath.startsWith(`${qrCodesRoot}${path.sep}`)) {      // Hack protection
        return res.status(400).json({
            message: 'Invalid asset id'
        });
    }

    if (!fs.existsSync(qrFilePath)) {
        return res.status(404).json({
            message: 'Asset QR code not found'
        });
    }

    return res.sendFile(qrFilePath);            //send qr
};

const updateAsset = async (req, res) => {
    try {
        const asset = await populateAssetQuery(
            Asset.findByIdAndUpdate(
                req.params.id,
                buildAssetPayload(req),
                {
                    new: true,
                    runValidators: true
                }
            )
        );

        if (!asset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        return res.status(200).json({
            message: 'Asset updated successfully',
            asset
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to update asset',
            error: error.message
        });
    }
};

const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);

        if (!asset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        return res.status(200).json({
            message: 'Asset deleted successfully',
            asset
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete asset',
            error: error.message
        });
    }
};


const returnAsset = async (req, res) => {
    try {
        const existingAsset = await Asset.findById(req.params.id);

        if (!existingAsset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        const employeeId = req.body.employee || req.body.employeeId || existingAsset.assignedTo;

        if (!employeeId) {
            return res.status(400).json({
                message: 'Asset is not assigned to an employee'
            });
        }

        existingAsset.status = 'Available';
        existingAsset.assignedTo = null;
        existingAsset.assignedDate = null;

        await existingAsset.save();

        const history = await AssetHistory.create({
            asset: existingAsset._id,
            employee: employeeId,
            action: 'returned',
            actionDate: new Date()
        });

        const asset = await populateAssetQuery(Asset.findById(existingAsset._id));

        return res.status(200).json({
            message: 'Asset returned successfully',
            asset,
            history
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to return asset',
            error: error.message
        });
    }
};

module.exports = {
    createAsset,
    getAssets,
    getAssetById,
    getAssetQrCode,
    updateAsset,
    deleteAsset,
    returnAsset,
    populateAssetQuery,
};
