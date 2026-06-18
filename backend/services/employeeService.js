const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const Employee = require('../models/Employee');

const employeeListFields = 'name empId email designation department phone';
const employeeDetailFields = 'name empId email designation department phone profilePic dateOfJoining';

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
        actionDate: historyItem.actionDate
    };
};



// GET ALL EMPLOYEE LIST

const getAllEmployees = () => {
    return Employee.find()
        .select(employeeListFields)
        .sort({ createdAt: -1 })
        .lean()
        .then((employees) => employees.map((employee) => ({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            designation: employee.designation,
            department: employee.department,
            empId: employee.empId
        })));
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
