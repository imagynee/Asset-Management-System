const Vendor = require('../models/Vendor');

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

module.exports = {
    createVendor,
    getVendors
};
