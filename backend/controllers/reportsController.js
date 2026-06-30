const XLSX = require('xlsx');

const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const Category = require('../models/Category');

const populateReportAssetQuery = (query) => {
    return query
        .populate('category')
        .populate('vendor')
        .populate('department')
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

const getDepartmentName = (department) => {
    if (!department) {
        return '';
    }

    return department.deptName || department.toString();
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
            'Department': getDepartmentName(asset.department),
            'Purchase Date': formatReportDate(asset.purchaseDate),
            'Purchase Cost': asset.purchaseCost ?? '',
            'Warranty Expiry Date': formatReportDate(asset.warrantyExpiry),
            'Status': asset.status || ''
        };

        if (includeAssignmentFields) {
            const emp = asset.assignedTo;
            if (emp) {
                row['Assigned To'] = emp.empId ? `${emp.name} (${emp.empId})` : emp.name || '';
            } else {
                row['Assigned To'] = '';
            }
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
    'Department',
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
        },
        disposed: {
            statuses: ['Disposed'],
            fileName: 'disposed-assets-report.xlsx',
            sheetName: 'Disposed Assets',
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

/* ─────────────────────────────────────────────────────────────
   FLEXIBLE REPORT GENERATOR  (used by new Reports UI)
   GET /api/reports/generate?type=assets|employees&status=all|assigned|available|maintenance|disposed&categoryId=all|<objectId>
   GET /api/reports/preview?type=assets|employees&status=all|assigned|available|maintenance|disposed&categoryId=all|<objectId>
───────────────────────────────────────────────────────────── */

const STATUS_MAP = {
    all:         null,
    assigned:    ['Assigned'],
    available:   ['Available'],
    maintenance: ['Maintenance', 'Maintenance Requested'],
    disposed:    ['Disposed'],
    returned:    ['Available'],   // returned assets end up back as Available
};

const buildAssetFilter = (status, categoryId) => {
    const filter = {};
    const statuses = STATUS_MAP[status] ?? null;
    if (statuses) filter.status = { $in: statuses };
    if (categoryId && categoryId !== 'all') filter.category = categoryId;
    return filter;
};

const generateReport = async (req, res) => {
    const { type = 'assets', status = 'all', categoryId = 'all' } = req.query;

    try {
        if (type === 'employees') {
            const employees = await Employee.find()
                .select('empId name email designation department phone dateOfJoining createdAt')
                .sort({ name: 1 });

            const rows = buildEmployeeReportRows(employees);
            return sendWorkbook(res, rows, 'employees-report.xlsx', 'Employees', employeeReportHeaders);
        }

        // Assets
        const filter = buildAssetFilter(status, categoryId);
        const includeAssignment = (status === 'assigned' || status === 'all');
        const assets = await populateReportAssetQuery(
            Asset.find(filter).sort({ assetName: 1 })
        );

        const headers = includeAssignment
            ? [...baseReportHeaders, 'Assigned To', 'Assignment Date']
            : baseReportHeaders;
        const rows = buildAssetReportRows(assets, includeAssignment);

        const statusLabel = status === 'all' ? 'all' : status;
        const fileName = `assets-${statusLabel}-report.xlsx`;
        return sendWorkbook(res, rows, fileName, 'Assets', headers);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to generate report', error: error.message });
    }
};

const previewReport = async (req, res) => {
    const { type = 'assets', status = 'all', categoryId = 'all' } = req.query;
    const PREVIEW_LIMIT = 100;

    try {
        if (type === 'employees') {
            const employees = await Employee.find()
                .select('empId name email designation department phone dateOfJoining createdAt')
                .sort({ name: 1 })
                .limit(PREVIEW_LIMIT);

            const total = await Employee.countDocuments();
            const rows = buildEmployeeReportRows(employees);
            return res.json({ rows, headers: employeeReportHeaders, total, preview: true });
        }

        const filter = buildAssetFilter(status, categoryId);
        const includeAssignment = (status === 'assigned' || status === 'all');
        const total = await Asset.countDocuments(filter);
        const assets = await populateReportAssetQuery(
            Asset.find(filter).sort({ assetName: 1 }).limit(PREVIEW_LIMIT)
        );

        const headers = includeAssignment
            ? [...baseReportHeaders, 'Assigned To', 'Assignment Date']
            : baseReportHeaders;
        const rows = buildAssetReportRows(assets, includeAssignment);
        return res.json({ rows, headers, total, preview: true });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to preview report', error: error.message });
    }
};

module.exports = {
    exportAssetReport,
    exportAllAssetsReport,
    exportAllEmployeesReport,
    generateReport,
    previewReport,
};
