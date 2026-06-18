const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const Employee = require('../models/Employee');
const generateTemporaryPassword = require('../utils/generateTemporaryPassword');
const sendEmployeeWelcomeEmail = require('../utils/sendEmployeeWelcomeEmail');

const removeUploadedFiles = (files = {}) => {       // If employee creation fails, delete uploaded files from disk.
    Object.values(files)
        .flat()                                      // keeps all values in a single array instead of nested arrays.
        .forEach((file) => {
            if (file && file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        });
};

const buildEmployeePayload = (req, hashedPassword) => {
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
        password: hashedPassword,
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
        const temporaryPassword = generateTemporaryPassword(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
        const employeePayload = buildEmployeePayload(req, hashedPassword);

        employee = await Employee.create(employeePayload);

        await sendEmployeeWelcomeEmail({
            employee,
            temporaryPassword
        });

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

module.exports = {
    createEmployee
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