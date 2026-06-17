const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
require('../models/Category');
require('../models/Vendor');
require('../models/Employee');

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
        console.log(asset);
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
        const assets = await populateAssetQuery(
            Asset.find().sort({ createdAt: -1 })
        );

        return res.status(200).json({
            count: assets.length,
            assets
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
        const asset = await populateAssetQuery(Asset.findById(req.params.id));

        if (!asset) {
            return res.status(404).json({
                message: 'Asset not found'
            });
        }

        return res.status(200).json({ asset });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch asset',
            error: error.message
        });
    }
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

const assignAsset = async (req, res) => {
    try {
        const employeeId = req.body.employee || req.body.employeeId || req.body.assignedTo;

        if (!employeeId) {
            return res.status(400).json({
                message: 'Employee id is required'
            });
        }

        const asset = await populateAssetQuery(
            Asset.findByIdAndUpdate(
                req.params.id,
                {
                    status: 'Assigned',
                    assignedTo: employeeId,
                    assignedDate: new Date()
                },
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

        const history = await AssetHistory.create({
            asset: asset._id,
            employee: employeeId,
            action: 'assigned',
            actionDate: asset.assignedDate
        });

        return res.status(200).json({
            message: 'Asset assigned successfully',
            asset,
            history
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to assign asset',
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
    updateAsset,
    deleteAsset,
    assignAsset,
    returnAsset
};
