const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Category = require('../models/Category');
const Vendor = require('../models/Vendor');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const {
    getSearchFilter,
    getPagination,
    getSort,
    toArray
} = require('../utils/listQuery');



const buildAssetPayload = (req) => {
    const allowedFields = [
        'assetId',
        'assetName',
        'category',
        'vendor',
        'department',
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
        .populate('department')
        .populate('assignedTo');
};

const assetSearchFields = ['assetId', 'assetName', 'model', 'serialNumber'];
const assetSortFields = ['assetId', 'assetName', 'model', 'serialNumber', 'status', 'purchaseDate', 'warrantyExpiry', 'createdAt'];

const buildAssetListFilter = (query) => {
    const filter = {
        ...getSearchFilter(query.search || query.q, assetSearchFields)
    };

    const statuses = toArray(query.status);
    const categories = toArray(query.category || query.categoryId);
    const vendors = toArray(query.vendor || query.vendorId);
    const departments = toArray(query.department || query.departmentId);
    const assignedTo = toArray(query.assignedTo || query.employeeId);

    if (statuses.length) {
        filter.status = { $in: statuses };
    }

    if (categories.length) {
        filter.category = { $in: categories };
    }

    if (vendors.length) {
        filter.vendor = { $in: vendors };
    }

    if (departments.length) {
        filter.department = { $in: departments };
    }

    if (assignedTo.length) {
        filter.assignedTo = { $in: assignedTo };
    }

    return filter;
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
    assetDetails.department = asset.department
        ? {
            _id: asset.department._id,
            deptName: asset.department.deptName,
            deptIncharge: asset.department.deptIncharge,
            additionalNote: asset.department.additionalNote
        }
        : null;
    assetDetails.assignedTo = formatEmployeeBrief(asset.assignedTo);

    return assetDetails;
};

const formatAssetListItem = (asset) => ({
    _id: asset._id,
    assetId: asset.assetId,
    assetName: asset.assetName,
    categoryName: asset.category?.categoryName || null,
    department: asset.department
        ? {
            _id: asset.department._id,
            deptName: asset.department.deptName,
            deptIncharge: asset.department.deptIncharge
        }
        : null,
    serialNumber: asset.serialNumber,
    model: asset.model,
    assignedTo: asset.assignedTo
        ? {
            _id: asset.assignedTo._id,
            empId: asset.assignedTo.empId,
            name: asset.assignedTo.name
        }
        : null
});

const assetStatuses = ['Available', 'Assigned', 'Maintenance', 'Disposed'];
const assignedHistoryActions = ['ASSIGNED', 'RETURNED', 'assigned', 'returned'];
const maintenanceHistoryActions = ['MAINTENANCE_STARTED', 'MAINTENANCE_COMPLETED'];
const disposedHistoryActions = ['DISPOSED'];

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

const formatDisposedHistory = (entry) => ({
    employee: formatEmployeeBrief(entry.employee),
    actionDate: entry.actionDate,
    status: 'disposed',
    remarks: entry.remarks
});

const createAsset = async (req, res) => {
    
    try {
        const asset = await Asset.create(buildAssetPayload(req));
        
        await QRCode.toFile(`uploads/AssetQrCodes/${asset.assetId}.png`, asset.assetId);
        
        return res.status(201).json({
            message: 'Asset created successfully',
            // asset
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
        const filter = buildAssetListFilter(req.query);
        const pagination = getPagination(req.query);
        const sort = getSort(req.query, assetSortFields, { createdAt: -1 });
        const assetQuery = Asset.find(filter)
            .select('_id assetId assetName category department serialNumber model assignedTo')
            .populate('category', 'categoryName')
            .populate('department', 'deptName deptIncharge additionalNote')
            .populate('assignedTo', '_id empId name')
            .sort(sort);

        if (pagination.hasPagination) {
            assetQuery.skip(pagination.skip).limit(pagination.limit);
        }

        const [assets, categories, vendors, departments] = await Promise.all([
            assetQuery,
            Category.find().sort({ categoryName: 1 }),
            Vendor.find().sort({ vendorName: 1 }),
            Department.find().sort({ deptName: 1 })
        ]);

        const totalCount = await Asset.countDocuments(filter);
        const response = {
            count: assets.length,
            totalCount,
            assets: assets.map(formatAssetListItem),
            categories,
            status: assetStatuses,
            vendors,
            departments
        };

        if (pagination.hasPagination) {
            response.pagination = {
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(totalCount / pagination.limit)
            };
        }

        return res.status(200).json(response);
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
                .populate('department', 'deptName deptIncharge')
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

        const disposedHistory = history
            .filter((entry) => disposedHistoryActions.includes(entry.action))
            .map(formatDisposedHistory);

        return res.status(200).json({
            asset: formatAssetDetails(asset),
            assignedHistory,
            maintenanceHistory,
            disposedHistory
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
        if (req.query.status === 'dispose') {
            const existingAsset = await Asset.findById(req.params.id);

            if (!existingAsset) {
                return res.status(404).json({
                    message: 'Asset not found'
                });
            }

            const employeeId = existingAsset.assignedTo || null;

            existingAsset.status = 'Disposed';
            existingAsset.assignedTo = null;
            existingAsset.assignedDate = null;
            await existingAsset.save();

            await AssetHistory.create({
                asset: existingAsset._id,
                employee: employeeId,
                action: 'DISPOSED',
                remarks: typeof req.body.remarks === 'string' && req.body.remarks.trim()
                    ? req.body.remarks.trim()
                    : 'Asset disposed',
                actionDate: new Date()
            });

            const asset = await populateAssetQuery(Asset.findById(existingAsset._id));

            return res.status(200).json({
                message: 'Asset disposed successfully',
            });
        }

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
            // asset
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
