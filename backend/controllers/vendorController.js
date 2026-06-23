const Vendor = require('../models/Vendor');
const Asset = require('../models/Asset');

const buildVendorPayload = (body) => {
    const allowedFields = [
        'vendorName',
        'contactPerson',
        'email',
        'phone',
        'address'
    ];

    const payload = {};

    allowedFields.forEach((field) => {
        if (body[field] !== undefined && body[field] !== '') {
            payload[field] = body[field];
        }
    });

    return payload;
};

const createVendor = async (req, res) => {
    try {
        const vendor = await Vendor.create(buildVendorPayload(req.body));

        return res.status(201).json({
            success: true,
            message: 'Vendor created successfully',
            vendor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to create vendor',
            error: error.message
        });
    }
};

const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().sort({ vendorName: 1 });

        return res.status(200).json({
            success: true,
            count: vendors.length,
            vendors
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors',
            error: error.message
        });
    }
};

const updateVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndUpdate(
            req.params.id,
            buildVendorPayload(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vendor updated successfully',
            vendor
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to update vendor',
            error: error.message
        });
    }
};

const deleteVendor = async (req, res) => {
    try {
        const assetCount = await Asset.countDocuments({ vendor: req.params.id });

        if (assetCount > 0) {
            return res.status(409).json({
                success: false,
                message: 'Vendor is assigned to one or more assets and cannot be deleted'
            });
        }

        const vendor = await Vendor.findByIdAndDelete(req.params.id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete vendor',
            error: error.message
        });
    }
};

module.exports = {
    createVendor,
    getVendors,
    updateVendor,
    deleteVendor
};
