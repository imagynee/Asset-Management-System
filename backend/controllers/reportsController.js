const XLSX = require('xlsx');

const Asset = require('../models/Asset');

const populateReportAssetQuery = (query) => {
    return query
        .populate('category')
        .populate('vendor')
        .populate('assignedTo');
};

const formatReportDate = (date) => {
    if (!date) {
        return '';
    }

    return new Date(date).toISOString().split('T')[0];
};

const getCategoryName = (category) => {
    if (!category) {
        return '';
    }

    return category.categoryName || category.toString();
};

const getVendorName = (vendor) => {
    if (!vendor) {
        return '';
    }

    return vendor.vendorName || vendor.toString();
};

const buildAssetReportRows = (assets, includeAssignmentFields = false) => {
    return assets.map((asset) => {
        const row = {
            'Asset ID': asset.assetId || '',
            'Asset Name': asset.assetName || '',
            'Model': asset.model || '',
            'Serial Number': asset.serialNumber || '',
            'Category Name': getCategoryName(asset.category),
            'Vendor': getVendorName(asset.vendor),
            'Purchase Date': formatReportDate(asset.purchaseDate),
            'Purchase Cost': asset.purchaseCost ?? '',
            'Warranty Expiry Date': formatReportDate(asset.warrantyExpiry),
            'Status': asset.status || ''
        };

        if (includeAssignmentFields) {
            row['Assigned To'] = asset.assignedTo?.name || '';
            row['Assignment Date'] = formatReportDate(asset.assignedDate);
        }

        return row;
    });
};

const baseReportHeaders = [
    'Asset ID',
    'Asset Name',
    'Model',
    'Serial Number',
    'Category Name',
    'Vendor',
    'Purchase Date',
    'Purchase Cost',
    'Warranty Expiry Date',
    'Status'
];

const sendWorkbook = (res, rows, fileName, sheetName, includeAssignmentFields = false) => {
    const headers = includeAssignmentFields ? [...baseReportHeaders, 'Assigned To', 'Assignment Date'] : baseReportHeaders;

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows, {
        header: headers
    });

    worksheet['!cols'] = headers.map((header) => ({ wch: Math.max(header.length + 2, 16) }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx'
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    return res.send(buffer);
};

const exportAssetReport = async (req, res) => {
    const reportConfigs = {
        available: {
            statuses: ['Available'],
            fileName: 'available-assets-report.xlsx',
            sheetName: 'Available Assets',
            includeAssignmentFields: false
        },
        assigned: {
            statuses: ['Assigned'],
            fileName: 'assigned-assets-report.xlsx',
            sheetName: 'Assigned Assets',
            includeAssignmentFields: true
        },
        maintenance: {
            statuses: ['Maintenance', 'Maintenance Requested'],
            fileName: 'maintenance-assets-report.xlsx',
            sheetName: 'Maintenance Assets',
            includeAssignmentFields: false
        }
    };

    const config = reportConfigs[req.params.reportType];

    if (!config) {
        return res.status(404).json({
            message: 'Asset report type not found'
        });
    }

    try {
        const assets = await populateReportAssetQuery(
            Asset.find({ status: { $in: config.statuses } }).sort({ assetName: 1 })
        );

        const rows = buildAssetReportRows(assets, config.includeAssignmentFields);

        return sendWorkbook(
            res,
            rows,
            config.fileName,
            config.sheetName,
            config.includeAssignmentFields
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to export asset report',
            error: error.message
        });
    }
};

module.exports = {
    exportAssetReport
};
