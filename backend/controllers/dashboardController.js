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

            // Fetch the newest assets for the dashboard table with assigned user details.
            Asset.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select('assetId assetName category vendor model status assignedTo createdAt')
                .populate('category')
                .populate('vendor')
                .populate('assignedTo')
                .lean()
        ]);

        return res.status(200).json({
            stats: {
                totalAssets,
                assignedAssets,
                availableAssets,
                underMaintenance
            },
            recentAssets
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
