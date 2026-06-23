const Asset = require('../models/Asset');
require('../models/Category');
require('../models/Vendor');
require('../models/Department');
require('../models/Employee');

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

const formatExpiringAsset = (asset, today) => ({
    _id: asset._id,
    assetId: asset.assetId,
    assetName: asset.assetName,
    warrantyExpiry: asset.warrantyExpiry,
    daysLeft: Math.max(0, Math.ceil((asset.warrantyExpiry - today) / MS_PER_DAY))
});

const formatExpiredAsset = (asset, today) => ({
    _id: asset._id,
    assetId: asset.assetId,
    assetName: asset.assetName,
    warrantyExpiry: asset.warrantyExpiry,
    expiredDays: Math.max(1, Math.ceil((today - asset.warrantyExpiry) / MS_PER_DAY))
});

const getDashboard = async (req, res) => {
    try {
        const [
            totalAssets,
            assignedAssets,
            availableAssets,
            underMaintenance,
            disposedAssets,
            assetsGroupedByCategory,
            recentAssets
        ] = await Promise.all([
            // Count every asset document in the collection.
            Asset.countDocuments(),

            // Count assets whose current status is assigned.
            Asset.countDocuments({ status: 'Assigned' }),

            // Count assets currently available for allocation.
            Asset.countDocuments({ status: 'Available' }),

            // Count assets currently marked for repair/maintenance.
            Asset.countDocuments({ status: 'Maintenance' }),

            // Count assets that have been disposed.
            Asset.countDocuments({ status: 'Disposed' }),

            // Count assets grouped by their category name.
            Asset.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: {
                        path: '$category',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: { $ifNull: ['$category.categoryName', 'Uncategorized'] },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                }
            ]),

            // Fetch the newest assets for the dashboard table with assigned user details.
            Asset.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('assetId assetName category department serialNumber status assignedTo')
                .populate('category', 'categoryName')
                .populate('department', 'deptName deptIncharge')
                .populate('assignedTo', 'name empId')
                .lean()
        ]);

        const assetsByCategory = assetsGroupedByCategory.reduce((categoryCounts, category) => {
            categoryCounts[category._id] = category.count;
            return categoryCounts;
        }, {});

        const assetStatusPercentages = {
            assigned: totalAssets === 0 ? 0 : Number(((assignedAssets / totalAssets) * 100).toFixed(2)),
            available: totalAssets === 0 ? 0 : Number(((availableAssets / totalAssets) * 100).toFixed(2)),
            underMaintenance: totalAssets === 0 ? 0 : Number(((underMaintenance / totalAssets) * 100).toFixed(2)),
            disposed: totalAssets === 0 ? 0 : Number(((disposedAssets / totalAssets) * 100).toFixed(2))
        };

        const formattedRecentAssets = recentAssets.map((asset) => ({
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
            status: asset.status,
            assignedTo: asset.assignedTo
                ? {
                    name: asset.assignedTo.name,
                    empId: asset.assignedTo.empId
                }
                : null
        }));

        return res.status(200).json({
            stats: {
                totalAssets,
                assignedAssets,
                availableAssets,
                underMaintenance,
                disposedAssets
            },
            assetsByCategory,
            assetStatusPercentages,
            recentAssets: formattedRecentAssets
        });
    } catch (error) {
        console.error('Dashboard fetch failed:', error);

        return res.status(500).json({
            message: 'Failed to fetch dashboard data'
        });
    }
};

const getWarrantyAlerts = async (req, res) => {
    try {
        const today = getStartOfToday();
        const expiringUntil = addDays(today, 31);

        const expiringQuery = {
            warrantyExpiry: {
                $gte: today,
                $lt: expiringUntil
            }
        };

        const expiredQuery = {
            warrantyExpiry: {
                $lt: today
            }
        };

        const [
            expiringCount,
            expiredCount,
            expiringAssets,
            expiredAssets
        ] = await Promise.all([
            Asset.countDocuments(expiringQuery),
            Asset.countDocuments(expiredQuery),
            Asset.find(expiringQuery)
                .select('_id assetId assetName warrantyExpiry')
                .sort({ warrantyExpiry: 1 })
                .lean(),
            Asset.find(expiredQuery)
                .select('_id assetId assetName warrantyExpiry')
                .sort({ warrantyExpiry: 1 })
                .lean()
        ]);

        return res.status(200).json({
            expiringCount,
            expiredCount,
            expiringAssets: expiringAssets.map((asset) => formatExpiringAsset(asset, today)),
            expiredAssets: expiredAssets.map((asset) => formatExpiredAsset(asset, today))
        });
    } catch (error) {
        console.error('Warranty alerts fetch failed:', error);

        return res.status(500).json({
            message: 'Failed to fetch warranty alerts'
        });
    }
};

module.exports = {
    getDashboard,
    getWarrantyAlerts
};
