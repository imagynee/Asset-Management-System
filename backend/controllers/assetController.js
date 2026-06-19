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

const formatEmployeeBrief = (employee) => {
    if (!employee) {
        return null;
    }

    return {
        _id: employee._id,
        empId: employee.empId,
        name: employee.name,
        phone: employee.phone,
        dept: employee.department
    };
};

const formatAssetDetails = (asset) => {
    const assetDetails = asset.toObject();

    assetDetails.vendor = asset.vendor
        ? {
            vendorName: asset.vendor.vendorName,
            phone: asset.vendor.phone
        }
        : null;

    assetDetails.category = asset.category?.categoryName || null;
    assetDetails.assignedTo = formatEmployeeBrief(asset.assignedTo);

    return assetDetails;
};

const assignedHistoryActions = ['ASSIGNED', 'RETURNED', 'assigned', 'returned'];
const maintenanceHistoryActions = ['MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED'];

const formatAssignedHistory = (entry) => ({
    employee: formatEmployeeBrief(entry.employee),
    actionDate: entry.actionDate,
    status: entry.action === 'ASSIGNED' || entry.action === 'assigned'
        ? 'assigned'
        : 'returned'
});

const formatMaintenanceHistory = (entry) => ({
    employee: formatEmployeeBrief(entry.employee),
    actionDate: entry.actionDate,
    status: entry.action === 'MAINTENANCE_STARTED'
        ? 'under maintenance'
        : 'maintenance completed'
});

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
            Asset.findById(req.params.id)
                .populate('vendor', 'vendorName phone')
                .populate('category', 'categoryName')
                .populate('assignedTo', 'empId name phone department'),
            AssetHistory.find({ asset: req.params.id })
                .populate('employee', 'empId name phone department')
                .sort({ actionDate: 1, createdAt: 1 })
        ]);

        if (!asset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        const assignedHistory = history
            .filter((entry) => assignedHistoryActions.includes(entry.action))
            .map(formatAssignedHistory);

        const maintenanceHistory = history
            .filter((entry) => maintenanceHistoryActions.includes(entry.action))
            .map(formatMaintenanceHistory);

        return res.status(200).json({
            asset: formatAssetDetails(asset),
            assignedHistory,
            maintenanceHistory
        });
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


module.exports = {
    createAsset,
    getAssets,
    getAssetById,
    getAssetQrCode,
    updateAsset,
    deleteAsset,
    populateAssetQuery,
};
