const XLSX = require('xlsx');

const Asset = require('../models/Asset');
const Employee = require('../models/Employee');

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

const employeeReportHeaders = [
    'Employee ID',
    'Name',
    'Email',
    'Designation',
    'Department',
    'Phone',
    'Date Of Joining',
    'Created Date'
];

const buildEmployeeReportRows = (employees) => {
    return employees.map((employee) => ({
        'Employee ID': employee.empId || '',
        'Name': employee.name || '',
        'Email': employee.email || '',
        'Designation': employee.designation || '',
        'Department': employee.department || '',
        'Phone': employee.phone || '',
        'Date Of Joining': formatReportDate(employee.dateOfJoining),
        'Created Date': formatReportDate(employee.createdAt)
    }));
};

const sendWorkbook = (res, rows, fileName, sheetName, headers) => {
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

        const headers = config.includeAssignmentFields
            ? [...baseReportHeaders, 'Assigned To', 'Assignment Date']
            : baseReportHeaders;
        const rows = buildAssetReportRows(assets, config.includeAssignmentFields);

        return sendWorkbook(
            res,
            rows,
            config.fileName,
            config.sheetName,
            headers
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to export asset report',
            error: error.message
        });
    }
};

const exportAllAssetsReport = async (req, res) => {
    try {
        const assets = await populateReportAssetQuery(
            Asset.find().sort({ assetName: 1 })
        );

        const headers = [...baseReportHeaders, 'Assigned To', 'Assignment Date'];
        const rows = buildAssetReportRows(assets, true);

        return sendWorkbook(
            res,
            rows,
            'all-assets-report.xlsx',
            'All Assets',
            headers
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to export all assets report',
            error: error.message
        });
    }
};

const exportAllEmployeesReport = async (req, res) => {
    try {
        const employees = await Employee.find()
            .select('empId name email designation department phone dateOfJoining createdAt')
            .sort({ name: 1 });

        const rows = buildEmployeeReportRows(employees);

        return sendWorkbook(
            res,
            rows,
            'all-employees-report.xlsx',
            'All Employees',
            employeeReportHeaders
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to export all employees report',
            error: error.message
        });
    }
};

module.exports = {
    exportAssetReport,
    exportAllAssetsReport,
    exportAllEmployeesReport
};
