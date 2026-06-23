const Department = require('../models/Department');
const Asset = require('../models/Asset');

const buildDepartmentPayload = (body) => {
    const fieldAliases = {
        deptName: body.deptName || body.departmentName || body.name,
        deptIncharge: body.deptIncharge || body.departmentIncharge || body.incharge,
        additionalNote: body.additionalNote || body.additionalNotes || body.note
    };

    const payload = {};

    Object.entries(fieldAliases).forEach(([field, value]) => {
        if (value !== undefined && value !== '') {
            payload[field] = value;
        }
    });

    return payload;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createDepartment = async (req, res) => {
    try {
        const payload = buildDepartmentPayload(req.body);

        if (!payload.deptName) {
            return res.status(400).json({
                success: false,
                message: 'Department name is required'
            });
        }

        const deptName = payload.deptName.trim();
        const existingDepartment = await Department.findOne({
            deptName: {
                $regex: `^${escapeRegex(deptName)}$`,
                $options: 'i'
            }
        });

        if (existingDepartment) {
            return res.status(409).json({
                success: false,
                message: 'Department already exists',
                department: existingDepartment
            });
        }

        const department = await Department.create({
            ...payload,
            deptName
        });

        return res.status(201).json({
            success: true,
            message: 'Department created successfully',
            department
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to create department',
            error: error.message
        });
    }
};

const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ deptName: 1 });

        return res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
            error: error.message
        });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const payload = buildDepartmentPayload(req.body);

        if (payload.deptName) {
            payload.deptName = payload.deptName.trim();
        }

        const department = await Department.findByIdAndUpdate(
            req.params.id,
            payload,
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            department
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Failed to update department',
            error: error.message
        });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const assetCount = await Asset.countDocuments({ department: req.params.id });

        if (assetCount > 0) {
            return res.status(409).json({
                success: false,
                message: 'Department is assigned to one or more assets and cannot be deleted'
            });
        }

        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete department',
            error: error.message
        });
    }
};

module.exports = {
    createDepartment,
    getDepartments,
    updateDepartment,
    deleteDepartment
};
