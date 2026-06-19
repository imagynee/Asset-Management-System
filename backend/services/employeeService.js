const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Employee = require('../models/Employee');
const {
    getSearchFilter,
    getPagination,
    getSort,
    toArray
} = require('../utils/listQuery');

const employeeListFields = 'name empId email designation department phone';
const employeeDetailFields = 'name empId email designation department phone profilePic dateOfJoining';
const employeeSearchFields = ['empId', 'name', 'email', 'department'];
const employeeSortFields = ['empId', 'name', 'email', 'designation', 'department', 'phone', 'createdAt'];

const assetPopulateQuery = (query) => {
    return query
        .populate('category', 'categoryName');
};

const formatAssignedAsset = (asset) => {
    return {
        assetName: asset.assetName,
        categoryName: asset.category?.categoryName,
        assetId: asset.assetId,
        serialNumber: asset.serialNumber,
        assignedDate: asset.assignedDate
    };
};

const formatHistoryAsset = (historyItem) => {
    const asset = historyItem.asset;

    return {
        assetName: asset?.assetName,
        assetId: asset?.assetId,
        categoryName: asset?.category?.categoryName,
        status: asset?.status,
        action: historyItem.action,
        remarks: historyItem.remarks,
        actionDate: historyItem.actionDate
    };
};



// GET ALL EMPLOYEE LIST

const buildEmployeeListFilter = (query) => {
    const filter = {
        ...getSearchFilter(query.search || query.q, employeeSearchFields)
    };

    const departments = toArray(query.department);
    const designations = toArray(query.designation);

    if (departments.length) {
        filter.department = { $in: departments };
    }

    if (designations.length) {
        filter.designation = { $in: designations };
    }

    return filter;
};

const getAllEmployees = async (query = {}) => {
    const filter = buildEmployeeListFilter(query);
    const pagination = getPagination(query);
    const sort = getSort(query, employeeSortFields, { createdAt: -1 });
    const employeeQuery = Employee.find(filter)
        .select(employeeListFields)
        .sort(sort);

    if (pagination.hasPagination) {
        employeeQuery.skip(pagination.skip).limit(pagination.limit);
    }

    const [employees, totalCount] = await Promise.all([
        employeeQuery.lean(),
        Employee.countDocuments(filter)
    ]);

    return {
        employees: employees.map((employee) => ({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            designation: employee.designation,
            department: employee.department,
            empId: employee.empId
        })),
        totalCount,
        pagination
    };
};

// GET EMPLOYEE DETAIL AND ASSIGNED ASSETS

const getEmployeeDetailsWithAssets = async (employeeId) => {
    const [employee, assignedAssets] = await Promise.all([
        Employee.findById(employeeId)
            .select(employeeDetailFields)
            .lean(),
        assetPopulateQuery(
            Asset.find({ assignedTo: employeeId }).sort({ assignedDate: -1, createdAt: -1 })
        ).lean()
    ]);

    return {
        employee,
        assignedAssets: assignedAssets.map(formatAssignedAsset)
    };
};

// GET ASSIGNMENT HISTORY OF THAT EMPLOYEE

const getEmployeeAssetHistory = (employeeId) => {
    return AssetHistory.find({ employee: employeeId })
        .populate({
            path: 'asset',
            select: 'assetName assetId category status assignedDate',
            populate: { path: 'category', select: 'categoryName' }
        })
        .sort({ actionDate: -1, createdAt: -1 })
        .lean()
        .then((history) => history.map(formatHistoryAsset));
};

module.exports = {
    getAllEmployees,
    getEmployeeDetailsWithAssets,
    getEmployeeAssetHistory
};
