const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const { populateAssetQuery } = require('./assetController');

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

const formatReturnedAsset = (entry) => {
    const asset = entry.asset;

    return {
        historyId: entry._id,
        _id: asset?._id || null,
        name: asset?.assetName || null,
        assetName: asset?.assetName || null,
        assetId: asset?.assetId || null,
        model: asset?.model || null,
        department: asset?.department
            ? {
                _id: asset.department._id,
                deptName: asset.department.deptName,
                deptIncharge: asset.department.deptIncharge
            }
            : null,
        categoryName: asset?.category?.categoryName || null,
        vendorName: asset?.vendor?.vendorName || null,
        status: 'returned',
        assignedTo: entry.employee
            ? {
                _id: entry.employee._id,
                empId: entry.employee.empId,
                name: entry.employee.name
            }
            : null,
        remarks: entry.remarks,
        actionDate: entry.actionDate
    };
};

const getReturnedAssets = async (req, res) => {
    try {
        const returnedAssets = await AssetHistory.find({ action: 'RETURNED' })
            .populate({
                path: 'asset',
                select: '_id assetName assetId model department category vendor',
                populate: [
                    {
                        path: 'department',
                        select: '_id deptName deptIncharge'
                    },
                    {
                        path: 'category',
                        select: 'categoryName'
                    },
                    {
                        path: 'vendor',
                        select: 'vendorName'
                    }
                ]
            })
            .populate('employee', '_id empId name')
            .sort({ actionDate: -1, createdAt: -1 });

        return res.status(200).json({
            count: returnedAssets.length,
            returnedAssets: returnedAssets.map(formatReturnedAsset)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch returned assets',
            error: error.message
        });
    }
};

const returnAsset = async (req, res) => {
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
                message: 'Only assigned assets can be returned'
            });
        }

        const employeeId = existingAsset.assignedTo;

        existingAsset.status = 'Available';
        existingAsset.assignedTo = null;
        existingAsset.assignedDate = null;

        await existingAsset.save();

        const history = await AssetHistory.create({
            asset: existingAsset._id,
            employee: employeeId,
            action: 'RETURNED',
            remarks: getRemarks(req, 'returned'),
            actionDate: new Date()
        });

        const asset = await populateAssetQuery(Asset.findById(existingAsset._id));

        return res.status(200).json({
            message: 'Asset returned successfully',
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to return asset',
            error: error.message
        });
    }
};

module.exports = {
    getReturnedAssets,
    returnAsset
};
