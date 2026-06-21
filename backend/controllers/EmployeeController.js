const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Employee = require('../models/Employee');
const Asset = require('../models/Asset');
const AssetHistory = require('../models/AssetHistory');
const {populateAssetQuery} = require('../controllers/assetController');

// const generateTemporaryPassword = require('../utils/generateTemporaryPassword');
// const sendEmployeeWelcomeEmail = require('../utils/sendEmployeeWelcomeEmail');
const {
    getAllEmployees,
    getEmployeeAssetHistory,
    getEmployeeDetailsWithAssets
} = require('../services/employeeService');

const removeUploadedFiles = (files = {}) => {       // If employee creation fails, delete uploaded files from disk.
    Object.values(files)
        .flat()                                      // keeps all values in a single array instead of nested arrays.
        .forEach((file) => {
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
};

const buildEmployeePayload = (req) => {
    const {
        name,
        empId,
        email,
        designation,
        department,
        phone,
        dateOfJoining,
    } = req.body;

    const payload = {
        name,
        empId,
        email,
        designation,
        department,
        phone,
        dateOfJoining,
    };

    if (req.files?.profilePic?.[0]) {   // "?." is called opotional chaining. If req.files exists check profilePic, Else return undefined (instead of throwing any error when req.files  undefined.)
        payload.profilePic = path.posix.join(
            '/uploads/employee/profilepic',
            req.files.profilePic[0].filename
        );
    }

    if (req.files?.idProofDoc?.[0]) {
        payload.idProofDoc = path.posix.join(
            '/uploads/employee/idproofs',
            req.files.idProofDoc[0].filename
        );
    }

    Object.keys(payload).forEach((key) => {                         //Remove empty values from the payload.
        if (payload[key] === undefined || payload[key] === '') {
            delete payload[key];
        }
    });

    return payload;
};

const createEmployee = async (req, res) => {
    let employee;

    try {
        // const temporaryPassword = generateTemporaryPassword(10);
        // const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        const employeePayload = buildEmployeePayload(req);

        employee = await Employee.create(employeePayload);

        // await sendEmployeeWelcomeEmail({
        //     employee,
        //     temporaryPassword
        // });

        const employeeResponse = employee.toObject();       
        delete employeeResponse.password;           // removes the pwd recieved from obj sent by .create() promise and before sending it to client.

        return res.status(201).json({
            success: true,
            message: 'Employee created successfully. Temporary login credentials were emailed to the employee.',
            employee: employeeResponse
        });
    } catch (error) {
        if (employee?._id) {   // suppose employee created in DB but email send failed, then remove that from the DB. keeps DB consistent.
            await Employee.findByIdAndDelete(employee._id);
        }

        removeUploadedFiles(req.files);     // employee creation failed, so remove uploaded docs from the disk.

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Employee with this email or employee ID already exists',
                error: error.message
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Failed to create employee',
            error: error.message
        });
    }
};

const validateEmployeeId = (employeeId, res) => {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        res.status(400).json({
            success: false,
            message: 'Invalid employee id'
        });

        return false;
    }

    return true;
};

const getEmployees = async (req, res) => {
    try {
        const {
            employees,
            totalCount,
            pagination
        } = await getAllEmployees(req.query);

        const response = {
            success: true,
            count: employees.length,
            totalCount,
            employees
        };

        if (pagination.hasPagination) {
            response.pagination = {
                page: pagination.page,
                limit: pagination.limit,
                totalPages: Math.ceil(totalCount / pagination.limit)
            };
        }

        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch employees',
            error: error.message
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        if (!validateEmployeeId(req.params.id, res)) {
            return;
        }

        const { employee, assignedAssets } = await getEmployeeDetailsWithAssets(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        return res.status(200).json({
            success: true,
            employee,
            assetDetails: assignedAssets
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch employee',
            error: error.message
        });
    }
};

const getEmployeeHistory = async (req, res) => {
    try {
        if (!validateEmployeeId(req.params.id, res)) {
            return;
        }

        const employee = await Employee.findById(req.params.id).select('_id');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const history = await getEmployeeAssetHistory(req.params.id);

        return res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch employee asset history',
            error: error.message
        });
    }
};


const assignAsset = async (req, res) => {
    try {
        const { employeeId, assetIds } = req.body;

        if (!employeeId) {
            return res.status(400).json({
                message: 'Employee id is required'
            });
        }

        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return res.status(400).json({
                message: 'At least one asset id is required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({
                message: 'Invalid employee id'
            });
        }

        const invalidAssetIds = assetIds.filter(
            (assetId) => !mongoose.Types.ObjectId.isValid(assetId)
        );

        if (invalidAssetIds.length) {
            return res.status(400).json({
                message: 'Invalid asset id(s)',
                invalidAssetIds
            });
        }

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        const assets = await Asset.find({
            _id: { $in: assetIds }
        });

        if (assets.length !== assetIds.length) {
            return res.status(404).json({
                message: 'One or more assets were not found'
            });
        }
        const alreadyAssigned = assets.filter(      // find all assets already assigned.
            asset => asset.status === 'Assigned'
        );

        if (alreadyAssigned.length) {
            return res.status(400).json({
                message: 'One or more assets are already assigned',
                alreadyAssigned
            });
        }

        const assignedDate = new Date();

        await Asset.updateMany(
            { _id: { $in: assetIds } },
            {
                $set: {
                    status: 'Assigned',
                    assignedTo: employeeId,
                    assignedDate
                }
            }
        );

        const histories = await AssetHistory.insertMany(
            assetIds.map((assetId) => ({
                asset: assetId,
                employee: employeeId,
                action: 'ASSIGNED',
                actionDate: assignedDate,
                remarks: 'Assigned to employee',
            }))
        );

        const updatedAssets = await populateAssetQuery(
            Asset.find({ _id: { $in: assetIds } })
        );

        return res.status(200).json({
            message: 'Assets assigned successfully',
            // assets: updatedAssets,
            // histories
        });
        
    } catch (error) {
        return res.status(400).json({
            message: 'Failed to assign assets',
            error: error.message
        });
    }

};

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeeById,
    getEmployeeHistory,
    assignAsset,
};



// Admin submits form
//         ↓
// Multer saves files
//         ↓
// createEmployee()
//         ↓
// Generate temp password
//         ↓
// Hash password
//         ↓
// Build employee object
//         ↓
// Save to MongoDB
//         ↓
// Send email
//         ↓
// Return response
