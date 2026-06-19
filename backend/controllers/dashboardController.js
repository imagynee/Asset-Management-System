const Asset = require('../models/Asset');
require('../models/Category');
require('../models/Vendor');
require('../models/Employee');

const getDashboard = async (req, res) => {
    try {
        const [
            totalAssets,
            assignedAssets,
            availableAssets,
            underMaintenance,
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
                .limit(10)
                .select('assetId assetName category serialNumber status assignedTo')
                .populate('category', 'categoryName')
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
            underMaintenance: totalAssets === 0 ? 0 : Number(((underMaintenance / totalAssets) * 100).toFixed(2))
        };

        const formattedRecentAssets = recentAssets.map((asset) => ({
            assetId: asset.assetId,
            assetName: asset.assetName,
            categoryName: asset.category?.categoryName || null,
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
                underMaintenance
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

module.exports = {
    getDashboard
};
